# UP2212140 Web Programming Coursework

Intial approach was to build out API and persistent storage (chose SQL as was familiar with it and other reasons)

This approach led me to think from a server first perspective. Meaning my design for the client relied on the server too heavily, which didnt fit the spec for the application as it needed to work cached.

My first approach was a standard MPA which utlised dynamic routes and server rendered pages. 

This added a level of complexity (bundler and renderer) very early on. This approach did have is benefits (list them), however, the application required a level of client side interactivity which lent it self better to SPA.

I rewrote the application as a SPA, intialially using `.inc` files to store the views/screens. I found that all these ` .inc` files where doing was referencing a component which represented the view, so decided to rethink the approach for storing the views. Which was ...

Structure:
- components:
  - shared (components shared accross application)
  - view_name (components that relate to this view or the theme of the view) 

During the rewright I decided to not implement presistent data storage until I had ironed out what specifically needed to be stored and when I would need access to it (I had a general idea from when I did the API and DB design); in the mean time I just used placeholder information. 

I also decided at this point that I would not implement anykind of "authentication" at this point until I had completed the core features.  