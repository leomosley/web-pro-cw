# Race Management Web App - UP2212140

## General Description of Implementation
The solution I implemented is a Single Page App where a user can choose from 4 roles:
1. Organiser - Creates and manages races
2. Participant - Participates in races
3. Volunteer - Help with races (managing checkpoints, recording times, etc)
4. Viewer  - Views timings of ongoing races

I designed the interface of the app for mobile view first and only. It does scale responsively however the layout does not change when

Users can choose to use the application in any roles capacity at any time. For example, you could organise a race and also participate in other races.

This is how I defined a race to work for my application:
- A runner checks into a race (links participant ID to race ID)
- All runners start at the same time (defined start time)
- As runners cross the finish line a volunteer at the finish line presses a button to record a finish time
  - Every time the button is pressed the time is recorded and pushed into an array
  - Creating a map of `position (index+1) =  positions[index]`
- Runners are then handed a physical position token by volunteer at the finish line (assuming that this is provided)
- Runners provide the volunteer at check outs with their participant ID and the position token they were given.
- This creates a link between the participant and their finish position which can be linked to the finish time recorded for that postion to give them a accurate race time with minmial opportunities for errors or foul play.  

## Description of Architecture

I tried to break the code up into self contained modules wherever possible. I found that this makes the developer experience better. I tried to reproduce the file structure I am used to working with in the past (Next.js App Router) as I find it is a nice way of splitting up the codebase. Below is tree diagram of the file structure with some brief annotations.

```python
src
├───client
│   │   index.htm
│   │   index.mjs
│   │   style.css
│   │
│   ├───components # Reusable custom elements 
│   │   ├───auth # Broken into subfolders for developer convience
│   │   ├───organiser
│   │   ├───participant
│   │   ├───race
│   │   ├───shared
│   │   └───volunteer
│   ├───lib
│   │       auth.mjs # Simulates authentication with localStorage
│   │       localStore.mjs  # localStorage wrapper
│   │       middleware.mjs # Exports functions
│   │       utils.mjs # Common utils for the client
│   │       views.mjs # Module for SPA functions 
│   │
│   └───views # .inc with contents of each view
├───pages
│       global-error.html # Error page returned from server
│       not-found.html # 404 page returned from server
│
└───server
    │   server.js # Main server file (creates Fastify app and registers API routes)
    │   utils.mjs # Util functions to be used on server
    │
    ├───api
    │   └───routes
    │           index.js # Exports all routes
    │           particpant.js
    │           race.js 
    │
    └───db
        │   database.sqlite
        │   index.js # Generates and exports SQLite client
        │   seed.js # Run with setup script to seed database
        │
        └───migrations
                001_init.sql
```

## Key Features

The key features of the application are:
1. Sign In/Up
2. Create a Race
3. Record Race Duration
4. Create Paticipant ID
5. Link Participants to Race
6. Record Race Position Times
7. Record Participant Finish Position
8. View Race Timings
9. Export Race Results from Server

### 1. Sign In/Up

When you first open the application you will only be allowed to vists pages defined in the `middleware.mjs` as `unprotected` until you either Sign In or Sign Up.

The Sign In and Up views contain a "form" where the user can input an email and password to either create an account or sign into one. 

These process only simulate an actual authentication system. No email or password is recorded, when the submit buttons are pressed the user is signed in no matter what.

The current user is stored in `localStorage` and stores the value for `id`, `role`, and `onboraded`. 

If the user has gone through the Sign Up view then they will be navigated to the oboarding page where they are prompted to select one of the 4 roles. Whatever, role they select will be selected as a favorited role and will be added to the center button of the bottom tabular navbar. This makes it easier to access.

If the use has gone through the Sign In page then they are brought to the homepage.

### 2. Create a Race

When you navigate to the `organise` page (through the home page or select `organiser` as your role to have it accessible in the navbar) there will be an option to 'Create A Race'.

This opens the create race page. This page contains a multi step form which lets you define basic details about the race (name, location, start_time, for example) in first step and in the second you are prompted to create the checkpoints for the race. At a minimum there must be 2 checkpoints (start and finish). Each checkpoint is created in the order they will be in and can each be given a name.

Once the user presses the submit button a POST request it made to store the race on the persitent storage on the server.

The user is then navigated to the races page where they can manage it.

### 3. Record Race Duration

On a races organise page (`organise?id=<race_id>`) the race organiser can press a button to start the race and then press the button again to stop the race. A record of these times is stored on the server (or locally if not possible) in order to calculate the duration of the race (end time - start time). 

Whilst the race is running (start time defined but no end time defined) a timer is displayed which calulates the amount of time elapsed from the start time (`Date.now()` - start time) every second. This works well as it is still accurate if you reload the page and the component has to be inserted into the dom again without the need for any state management tool.

### 4. Create Participant ID

When the user visits the participant page for the first time they are prompted to generate a participant ID so they can use it to check into races.

When this button is pressed it sends a POST request to generate and store a participant ID on the server (to maintain uniqueness of identifier). The ID returned is then stored in localStorage on the device and a barcode for the ID generated. 

This barcode does not actually work as I was not able to implement this feature (all though I tried) without using a library. I was not planning to implement a barcode scanner in the application either so I knew that whether it worked or not did not matter. 

In a real scenario I would have implemented a working barcode with a scanner as well to improve efficency. 

### 5. Link Participants to Race

On the volunteer page for a race (`volunteer?id=<race_id>`) (is accessed when provided with a link to the page by race organiser) the user can select from three task to perform as a volunteer: Check In, Check Out, and Manage Checkpoints. 

When the Check In task is selected the page is updated to show a form where the user can enter a participant ID. Once they submit the ID a POST request is made to the database to create a record linking the user to race and they are marked as checked in.

If a user tries to check out of a race without having checked in they will not be able to as there is no record linking them to the race.

### 6. Record Race Position Times

If the volunteer user selects the Manage Checkpoint task and then selects the last checkpoint (finish) they are presented with a button which can be pressed to add a time to the position array. Once the race has finished the user can then press the submit button which makes a POST request with the array of positions and the race ID to create records of the position times for that race.  

### 7. Record Participant Finish Position

If the volunteer user selects the Check Out task the page is updated to show a form where the can input the participant ID and position number (their position token). When submitted this sends a POST request with this information to make a record of the finish position linked to the participant ID. 

### 8. View Race Timings

If the user navigates to a races view page (`view?id=<race_id>`) which can be navigated to when shared the link to view the race by a participant, volunteer, or organiser. 

This page displays the current elapsed time and that is pretty much it. 

The user has the option to select a specfic checkpoint that this timings page might be displayed at where it will display the checkpoints number and name. 

This feature could be useful for displaying the current elapsed time at checkpoints or finish line on large screens for runners and viewers to see.

### 9. Export Race Results from Server

When the user clicks the view results button on a races organise page they are taken to the `race/results` page where a table of the positions and their times are listed. There is a column for the participant ID associated with a finish position, this is empty if the checkouts have not been completed.

At the top of this page there is a button which when clicked converts the array of objects in to CSV format and then creates a downloadable object in the form of a `.csv` file which is automatically downloaded.

## Development of Implementation

My intial approach when developing this was to design and implement the API and persistent storage. In my mind these were core features and needed to be implemented as soon as possible. I tought I had a good idea of the data that would need to be stored and the shape it would take.

However, I found that this was not the case and actually I needed to understand more about how the application would work before I got to this step. This approach also led me to think from a server first perspective which meant my orignal design was too heavily server oriented. 

It did not help that all my previous experience in web development was using a server first paradigm with React Server Components and server rendered pages. 

I attempted to implement these kind of features when I first started developing my application as a MPA which utilised dynamic routes and server rending pages. Creating uneeded levels of complexity (bundler and renderer) very early on. 

The more I considered application I decided that it had a level of client side interactivity which lent itself better to SPAs.

I rewrote the application as a SPA, intialially using `.inc` files to store the markdown for each page. As the requirements of each view grew I moved to a architecture where each `.inc` file provides a reference to a custom element for each view. These custom elements all utilised Shadow DOM and templates to improve the encapsulation and reusability. 

Once I had implemented most of the features using localStorage I was then able to start considering the implementation of my API and persistent storage. The one benefit of my approach at the start was that I already knew how to implement the database and API routes, I just had to ammend the implementation to fit my new designs.

## Critical Analysis

There are many areas of my application that I would have liked to improve and their are many features which I wanted to implement but have not. 

I think that although I have created resuable custom elements I have not implemented enough reusable styles. This lead to certain areas of inconsistency in the UI and alot more inline styles in templates than was needed. 

In general the user is not provided with many informative error messages when issues to arise. This feauture would have improved the user expereience.

The current implementation does not support multiple users performing tasks like checking out or recording position times at the same time. If these records are made locally and then submitted to the database at different times the server does not anticpate that and will lead to conflicts in the database.

My implementation makes it hard for a user to manage a small race by themselves. They would have to fufil the role of multiple volunteers whilst being the organiser. This is not feasible and means that this application is only really suited to at least medium scale operations with at least 3 volunteers (check in ,check out, and manage finish line).

The use of webhooks (or some other method) for volunteer pages so that when the race updates (stop, starts, etc) the page updates without the user having to manually reload.

Locally persistent state management for forms would have improved user experience. If the user is creating a race and reloads the page accidentally the fields of the form they have filled out are reset.

Despite all these shortcomings I do feel like the application it self,  with a slightly more features and added robustness would be an acutal functional application for the task of creating and managing races in this format.

## AI and Other Sources

My design was infulenced by my experience wi th `tailwindcss` and component libraries like `shadcn`. I found that I would reference the tailwind documentation when I wanted a specific utilitiy which it provides. I used `shadcn`'s tailwind config for a reference as to how to apply spacing and colours.  

All icons used in this application were from [lucide.dev](https://lucide.dev). I choose this library as I had expereince with it and I choose to only use this library to improve the consitency of the design.

### Prompt for Create API Route Utility Function

When developing my API I noticed that there were cases when I was repeating portions of code for things like error handling and ensuring that required parameters have been supplied. I wanted to create a function which would simplify the process of creating an API route.

> How can I create a utility function for creating a API route in my fastify app. How could I make it so that I can define required parameters from the body, params, searchquery etc.  

```js
export function createAPIRoute(app, {
  method,
  url,
  handler,
  requiredParams = []
}) {
  app.route({
    method,
    url,
    handler: async (req, reply) => {
      const { params = {}, query = {}, body = {} } = req;
      const all = { ...params, ...query, ...body };

      for (const param of requiredParams) {
        if (!(param in all)) {
          return reply.status(400).send({ error: `Missing required parameter: ${param}` });
        }
      }

      const result = await handler({ ...req, params, query, body }, reply);
      reply.send(result);
    }
  });
}
```

The response it provided gave me an idea on how to pass in the required parameters and check that they are present in the request.

However, it didn't add any error handling for cases when the handler function raised an error and I had to add this part.

### Parallel Promises

I had a few cases in my app where I had to await multiple promises in succession. I did not want to have to iterate through the promises at iteration awaiting for the promise to resolve. I remembered Rich talking about `Promise.all` in a lecture and asked the following prompt to see if it was feasible and actually useful for my situation.

> How can you run promises in parallel in js and does this actually improve performance?

The response was helpful and I am now aware of this as a method for parallelising promises. I used this multiple times throughout the codebase.

### Creating Custom Events

I needed to create some custom events to deal with navigation changes as the built in ones were not having the desired affect.

> Can you create your own custom events to listen for in js. I know you can dispatchEvent other events. Is there a way of defining your own events with custom names and contents?

This prompt was useful as it actually showed me how simple it is to create a custom event.

### Pathname Regex

I needed a regex that would clean the pathname of things like search queries in my `readPath` function

> Create me a regex to strip out any search queries or other elements which could be inside window.location.pathname that aren't related to the actual path.

The regex it provided worked for my usecase. However, I have not tested all edge cases and there could still be stuff it lets slip through.

### `localStorage` Wrapper

Due to how often I would be using local storage in this application I wanted to improve the expereience of adding and setting items.

My plan was to implement almost like a kind of ORM with some level of typesaftey. 

> Would it be a good idea to add a wrapper around local storage in my js project to simplfy getting and settings values in it. I dont want to keep having to remember how to convert it to and from JSON. Is this a horrible idea or not?

```js
const storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  }
};
```

The response gave me a clear idea of how to implement something like this but kind of sucked in terms of actual beneficial features.

### Attempt to Implement a Barcode

I wanted to add a barcode representation of the participants ID that could be "used" to check them in.

> Create me a custom element which takes an attribute value, a string, and converts it into a barcode that is displayed. You must not use any libraries.

Its response showed me how to make something that looked like barcode but was not actually usable.

> How could I actually make it a real barcode. Without any libraries?

I tried varations of this prompt and every response the method it provided was not working for some reason.

I decided that this feature wasnt important and just left the barcode as not working.