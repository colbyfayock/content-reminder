require('dotenv').config();
const fetch = require('node-fetch');

const { promiseToConvertXmlToJson } = require('./lib/feeds');
const { promiseToWriteFile, promiseToReadFile } = require('./lib/files');
const { sendMail } = require('./lib/mail');
const { shuffle } = require('./lib/util');

const sourcesRss = require('../sources-rss');
const sourcesStatic = require('../sources-static');

const PATH_TO_CONTENT = './data/content.json';

async function run() {

  // Get existing data

  let content;

  try {
    const contentRaw = await promiseToReadFile(PATH_TO_CONTENT);
    const contentJson = JSON.parse(contentRaw) || {};
    content = contentJson.content;
  } catch(e) {
    console.log('File missing or corrupted, starting from scratch.');
    content = [];
  }

  // Determine if we're at the end of our current content cycle. If we are,
  // refresh the source data

  if ( content.length === 0 ) {
    console.log('Content is empty, refreshing from source.');

    const sourceData = await getSourceData();

    content = shuffle(sourceData);
  }

  // Grab an item from the top of the list

  const update = content.shift();

  // Build a message and send it as an email

  let message = "";

  message += "Title: " + update.title + "\r\n";
  message += "Link: " + update.link + "\r\n";
  message += "Date Published: " + update.pubDate + "\r\n";
  message += "\r\n";
  message += "From " + update.source.title + " " + update.source.link

  console.log(`Sharing content: ${update.title}`);

  sendMail({
    subject: `New Content to Share: ${update.title}`,
    message
  });

  // Construct our content cache and save it to the filesystem with any updates

  const fileData = {
    content
  }

  await promiseToWriteFile(PATH_TO_CONTENT, JSON.stringify(fileData));

  console.log(`Saved updated content to ${PATH_TO_CONTENT}`);
}

run();


/**
 * getSourceData
 */

async function getSourceData() {

  const content = [
    ...sourcesStatic
  ];

  // Fetch all of the RSS feed content

  const feedsWithRaw = await Promise.all(sourcesRss.map(async (feed) => {
    const { url } = feed;
    const response = await fetch(url);
    const raw = await response.text();
    return {
      ...feed,
      raw
    }
  }));

  const feedsWithJson = await Promise.all(feedsWithRaw.map(async (feed) => {
    const { raw } = feed;
    const json = await promiseToConvertXmlToJson(raw);
    return {
      ...feed,
      json
    }
  }));

  feedsWithJson.forEach(({ json = {}, filters = {} }) => {
    const { rss } = json;

    if ( !rss ) return;

    rss.channel.forEach(channel => {
      channel.item.forEach(item => {
        const title = item.title && item.title[0];
        const link = item.link && item.link[0];
        const pubDate = item.pubDate && item.pubDate[0];
        const sourceTitle = channel.title && channel.title[0];
        const sourceLink = channel.link && channel.link[0];

        if ( filters.after ) {
          const pubDateTimestamp = pubDate && new Date(pubDate).getTime();
          if ( pubDateTimestamp < filters.after ) return;
        }

        if ( filters.before ) {
          const pubDateTimestamp = pubDate && new Date(pubDate).getTime();
          if ( pubDateTimestamp > filters.before ) return;
        }

        content.push({
          title,
          link,
          pubDate,
          source: {
            title: sourceTitle,
            link: sourceLink
          }
        });
      });
    });
  })

  return content;
}