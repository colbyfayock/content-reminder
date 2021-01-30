# ⏰ Content Reminder

For all the content I can make, the one thing I always forget to do is continue sharing it past it's launch date.

While there are automation tools that allow you to automatically Tweet RSS feeds or schedule recurring content, it's not quite the same as putting together a hand crafted update, also those solutions are typically pretty expensive.

## What does this do?

Content Reminder is a relatively simple script that aggregates different sources of content links, piles them all together, shuffles them, then using a GitHub Action workflow, sends you an email at the frequency you choose with a new suggested link to share.

## Getting Started

#### Requirements
* SendGrid account - this sends the mail, you could optionally swap the code in `./src/lib/mail.js` to something else
* An email set up in SendGrid you can send from

### Setting It Up

1. Fork This Repository

The project depends on [GitHub Actions](https://github.com/features/actions). Forking the repository will ensure that will continue working the way it's set up by default, though you could probably figure out a solution using a different Git provider or even a lambda function.

2. Update `./sources-*.js`

The RSS feeds will pull in all of the links available and static is just a list you can hard code.

3. Delete `./data/content.json`

This works by storing a "working" copy of the feed data so that each time it runs, it `shift`s off a new item to share. This file won't regenerate until it's empty, so if you don't clear this, it will continue sending my stuff for a little bit.

5. Add Screts to Repository

Navigate in your repository to Settings > Secrets, then set the following Secrets:
* `SENDGRID_API_KEY`: your unique SendGrid API key
* `MAIL_TO`: the email you'd like these notifications to go to
* `MAIL_FROM`: this should be the email you can send from using SendGrid 


### Configuration

#### Updating the Notification Schedule

You can tune the `./.git/workflows/update.yml` file to the cron schedule of your liking

By default it's set to send an email at 9am EST every day.
