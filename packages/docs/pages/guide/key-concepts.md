# Key Concepts

We will cover four main terms of Flowline before creating our first flow.

## App

👉 Apps are the third-party services you can use with Flowline, like Twitter, Github and Slack. You can check the complete list of available apps [here](/guide/available-apps). Flowline aims to connect those apps to help you build workflows. So whenever you work with other concepts of Flowline, you will use apps.

:::tip

You can request a new integration [here](/guide/request-integration). We will collect all the requests and prioritize the most requested ones.

:::

## Connection

📪 To use an app, you need to add a connection first. Connection is essentially the place where you pass the credentials of the specified service, like consumer key, consumer secret, etc., to let Flowline connect third-party apps on your behalf. When you click "Add connection" and choose an app, you'll be prompted for the required fields for the connection. You can also add multiple connections if you have more than one account for the same app.

## Flow

🛠️ Flow is the most crucial part of Flowline. It's a place to arrange the business workflow by connecting multiple steps. So, for example, we can define a flow that does:

- **Search tweets** for the "Flowline" keyword.
- **Send a message to channel** which posts found tweets to the specified Slack channel.

## Step

📄 Steps are the individual items in the flow. In our example, **searching tweets** and **sending a message to channel** are both steps in our flow. Steps have two different types, which are trigger and action. Trigger steps are the ones that start any flow you would like to build with Flowline, like "search tweets". You can think them as starting points. Action steps are the following steps that define what you would do with the incoming data from previous steps, like "sending a message to channel" in our example. Flows can also have more than two steps. The first step of each flow should be the trigger step, and the following steps should be action steps.
