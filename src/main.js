require('dotenv').config();
const fetch = require('node-fetch');

const { promiseToConvertXmlToJson } = require('./lib/feeds');
const { promiseToWriteFile, promiseToReadFile } = require('./lib/files');
const { sendMail } = require('./lib/mail');
const { shuffle } = require('./lib/util');

const { rss } = require('../sources');

const PATH_TO_CONTENT = './data/content.json';

async function run() {

  // Get existing data

  const contentRaw = await promiseToReadFile(PATH_TO_CONTENT);
  const contentJson = JSON.parse(contentRaw) || {};
  const { content } = contentJson;

  // Grab an item from the top of the list

  const update = content.shift();

  // Build a message and send it as an email

  let message = "";

  message += "Title: " + update.title + "\r\n";
  message += "Link: " + update.link + "\r\n";
  message += "Date Published: " + update.pubDate + "\r\n";
  message += "\r\n";
  message += "From " + update.source.title + " " + update.source.link

  sendMail({
    subject: `New Content to Share: ${update.title}`,
    message
  })

  console.log(`Sharing content: ${update.title}`);

  // Determine if we're at the end of our current content cycle. If we are,
  // refresh the source data to save

  let contentToSave = content;

  if ( contentToSave.length === 0 ) {
    console.log('Content is empty, refreshing from source.');

    const sourceData = await getSourceData();

    contentToSave = shuffle(sourceData);
  }


  // Construct our content cache and save it to the filesystem with any updates

  const fileData = {
    content: contentToSave
  }

  await promiseToWriteFile(PATH_TO_CONTENT, JSON.stringify(fileData));

  console.log(`Saved updated content to ${PATH_TO_CONTENT}`);
}

run();


/**
 * getSourceData
 */

async function getSourceData() {

  const content = [];

  // Fetch all of the RSS feed content

  const feedsRss = await Promise.all(rss.map(async ({ url }) => {
    const response = await fetch(url);
    return await response.text();
  }));

  const feedsJson = await Promise.all(feedsRss.map(async (feed) => {
    return await promiseToConvertXmlToJson(feed)
  }));

  feedsJson.forEach(({ rss } = {}) => {
    if ( !rss ) return;

    rss.channel.forEach(channel => {
      channel.item.forEach(item => {
        content.push({
          title: item.title[0],
          link: item.link[0],
          pubDate: item.pubDate[0],
          source: {
            title: channel.title[0],
            link: channel.link[0]
          }
        });
      });
    });
  })

  return content;
}