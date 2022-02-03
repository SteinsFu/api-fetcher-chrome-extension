<div id="top"></div>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">API Fetcher Chrome Extension</h3>

  <p align="center">
    A Chrome extension to fetch APIs in popup widget
    <br />
    <a href="https://github.com/SteinsFu/api-fetcher-chrome-extension/issues">Report Bug</a>
    ·
    <a href="https://github.com/SteinsFu/api-fetcher-chrome-extension/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#3rd-party-libraries">3rd-Party Libraries</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#bootstrap-5-css-and-icons">Bootstrap 5 CSS and Icons</a>
        <li><a href="#how-to-add-an-api-card">How to add an API Card</a>
        <li><a href="#statement-evaluation">Statement Evaluation</a>
        <ul>
          <li><a href="#evaluation-limitations">Evaluation Limitations</a>
        </ul>
        <li><a href="#examples">Examples</a>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>




<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

This is a Chrome extension for users to customize widgets to fetch APIs and show the results in a customized way in the extension popup window.

<div align="center"><img src="demo/images/popup.png" height="500"></div>

<p align="right">(<a href="#top">back to top</a>)</p>



### 3rd-Party Libraries

Download Links:
* [JQuery 3.6.0](https://code.jquery.com/jquery-3.6.0.min.js)
* [Bootstrap 5.1.3](https://github.com/twbs/bootstrap/releases/download/v5.1.3/bootstrap-5.1.3-dist.zip)
* [Bootstrap Icons 1.8.0](https://github.com/twbs/icons/releases/tag/v1.8.0)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/SteinsFu/api-fetcher-chrome-extension.git
   ```
2. Go to [chrome://extensions](chrome://extensions) and turn on **Developer mode**
3. Click **Load unpacked** and choose the `api-fetcher-chrome-extension` folder

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

### Bootstrap 5 CSS and Icons
We are using Bootstrap 5 css and icons. you can insert html with Bootstrap 5 css.
- Bootstrap doc: https://getbootstrap.com/docs/5.1/getting-started/introduction/
- Bootstrap icons: https://icons.getbootstrap.com/

### How to add an API Card
1. Click the extension icon
2. Click the edit button on the top-left corner of the popup to go to the **main edit page**.
3. Input the API url and input your prefered HTML code for displaying the results of the API fetch.
4. Click the _blue_ + button.

<div align="center"><img width="1000" src="demo/images/main_page.png"></div>
<p align="center">main edit page</p>
</br>

### Statement Evaluation
- Use `{}` to evaluate the statement
- Use `$data` to access the response data
- Use `<var-name>=<value>;` to declare variable (card scope) (before your evalution statement)
- Use `$vars.<var-name>` to access your variable
- e.g.
  - response:
  ```json
  {
    "contents": [
      {
        "info": {"title": "Hello World"}
      }
    ]
  }
  ```
  - You can write your html code and access the `title` like this:
  ```html
  <p> Title: {x=5;y=add($vars.x, 2);i=randomInt($data.contents.length);$data.contents[$var.i].info.title} </p>
  <p> Variable x: {$vars.x} (Expected: 5) </p>
  <p> Variable y: {$vars.y} (Expected: 7) </p>
  ```

#### Evaluation Limitations
- Cannot use javascript operators such as `+` `-` `*` `/` `%` `&&` `||` etc.
- Unless wrapped by function, value of variables will be in `string`
  - e.g. Use `{s=Hello World;}` instead of `{s="Hello World";}`}
  
- Only the following functions are allowed to use inside `{}`:

  | Function    | Return      |
  | ----------- | ----------- |
  | `add(a, b, c, ...)` | `a + b + c + ...` |
  | `sub(a, b)` | `a - b` |
  | `mul(a, b, c, ...)` | `a * b * c * ...` |
  | `div(a, b)` | `a / b` |
  | `mod(a, b)` | `a % b` |
  | `int(x)` | cast x to integer |
  | `and(a, b, c, ...)` | `a && b && c && ...` |
  | `or(a, b, c, ...)` | `a || b || c || ...` |
  | `randomInt(max)` | random integer in range [0, max) |
  | `JSONstringify(value, replacer, space)` | `JSON.stringify(value, replacer, space)` |
  | `JSONparse(text, reviver)` | `JSON.parse(text, reviver)` |

- For Developers/Contributers: If you want to add more functions, please add into `popup.js` `FNS` constant (please follow the [Contributing](#contributing) steps):
  ```javascript
  const FNS = {
    "add": (...args) => args.reduce((acc, cur) => Number(acc) + Number(cur), 0),
    "sub": (a, b) => Number(a) - Number(b),
    "mul": (...args) => args.reduce((acc, cur) => Number(acc) * Number(cur), 1),
    "div": (a, b) => Number(a) / Number(b),
    "mod": (a, b) => Number(a) % Number(b),
    "int": (x) => parseInt(x), 
    "and": (...args) => args.reduce((acc, cur) => Boolean(acc) && Boolean(cur), true),
    "or": (...args) => args.reduce((acc, cur) => Boolean(acc) || Boolean(cur), false),
    "randomInt": (max) => Math.floor(Math.random() * parseInt(max)),
    <== add here...
  }
  ```

### Examples
1. Weather API
   - url: https://openweathermap.org/data/2.5/onecall?lat=39.76&lon=-98.5&units=metric&appid=439d4b804bc8187953eb36d2a8c26a02
   - response:
     ```json
     {
       "timezone": ...,
       "current": {
         "temp": ...,
         "weather": [
           {"description": ...}
         ],
         ...
       },
       ...
     }
     ```
   - html:
     ```html
     <p>Timezone: {$data.timezone}</p>
     <p>Temperature: {$data.current.temp} C</p>
     <p>Weather: {$data.current.weather[0].description} </p>
     ```
  <div align="center"><img src="demo/images/weather.png"></div>
  </br>

2. Weather API with Bootstrap Icons
   - url: https://openweathermap.org/data/2.5/onecall?lat=39.76&lon=-98.5&units=metric&appid=439d4b804bc8187953eb36d2a8c26a02
   - html:
     ```html
     <p>
       <i class="bi bi-map"></i>
       Timezone: {$data.timezone}
     </p>
     <p>
       <i class="bi bi-thermometer-half"></i>
       Temperature: {$data.current.temp} C
     </p>
     <p>
       <i class="bi bi-cloud"></i>
       Weather: {$data.current.weather[0].description} 
     </p>
     ```
   <div align="center"><img src="demo/images/weather_with_icons.png"></div>
   </br>


3. Pixiv Illustration API #1
   - url: https://www.pixiv.net/ranking.php?format=json&content=illust
   - response:
     ```json
     {
       "contents": [
         {"illust_id": ...},
         ...
       ]
     }
     ```
   - html (example 1: get the **first result** in contents):
     ```html
     <img 
       width="400" 
       src="https://pximg.rainchan.win/img?img_id={$data.contents[0].illust_id}&web=true"
     >
     ```
   - html (example 2: get a **random result** in contents):
     ```html
     <img 
       width="400" 
       src="https://pximg.rainchan.win/img?img_id={$data.contents[randomInt($data.contents.length)].illust_id}&web=true"
     >
   <div align="center"><img src="demo/images/pixiv_img.png"></div>
   </br>


4. Pixv Illustraion API #2
   - url: https://www.pixiv.net/ranking.php?format=json&content=illust
   - html (example 1: get the **first 9 results**):
   ```html
   <div class="row">
     <div class="col-4 mb-4 mb-lg-0">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[0].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[1].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[2].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
     </div>
     <div class="col-4 mb-4 mb-lg-0">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[3].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[4].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[5].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
     </div>
     <div class="col-4 mb-4 mb-lg-0">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[6].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[7].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       <img src="https://pximg.rainchan.win/img?img_id={$data.contents[8].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
     </div>
   </div>
   ```
   - html (example 2: declare **9 random integers** as **variables** for each and get random results):
   ```html
   {pixivUrl=https:/www.pixiv.net/artworks;pixivProxy=https:/pximg.rainchan.win/img;}
   <div class="row">
     <div class="col-4 mb-4 mb-lg-0">
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
     </div>
     <div class="col-4 mb-4 mb-lg-0">
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
     </div>
     <div class="col-4 mb-4 mb-lg-0">
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
       <a href="{$vars.pixivUrl}/{i=randomInt($data.contents.length);$data.contents[$vars.i].illust_id}">
         <img src="{$vars.pixivProxy}?img_id={$data.contents[$vars.i].illust_id}&web=true" class="w-100 shadow-1-strong rounded mb-4">
       </a>
     </div>
   </div>
   ```
   <div align="center"><img src="demo/images/pixiv_gallery.png"></div>
   </br>

5. News API
   - url: https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json
   - response:
   ```json
   {
     "articles": [
       {
         "author": ...,
         "title": ...,
         "url": ...,
         "urlToImage": ...,
         ...
       },
       ...
     ]
   }
   ```
   - html (example 1: just get the **first** article):
   ```html
   <div class="d-flex">
     <a href="{$data.articles[0].url}" class="d-flex justify-content-center">
       <img src="{$data.articles[0].urlToImage}" class="rounded" height="100">
     </a>
     <div class="flex-grow-1 ms-3">
       <p class="h6">{$data.articles[0].title}</p>
     </div>
   </div>
   ```
   - html (example 2: declare a **random integer** as **variable** and get a random article):
   ```html
   <div class="d-flex">
     <a href="{i=randomInt($data.articles.length);$data.articles[$vars.i].url}" class="d-flex justify-content-center">
       <img src="{$data.articles[$vars.i].urlToImage}" class="rounded" height="100">
     </a>
     <div class="flex-grow-1 ms-3">
       <p class="h6">{$data.articles[$vars.i].title}</p>
     </div>
   </div>
   ```
   - html (example 3: declare the variables at the top):
   ```html
   {i=randomInt($data.articles.length);}
   <div class="d-flex">
     <a href="{$data.articles[$vars.i].url}" class="d-flex justify-content-center">
       <img src="{$data.articles[$vars.i].urlToImage}" class="rounded" height="100">
     </a>
     <div class="flex-grow-1 ms-3">
       <p class="h6">{$data.articles[$vars.i].title}</p>
     </div>
   </div>
   ```
   <div align="center"><img src="demo/images/news.png"></div>
   </br>

6. Noembed.com Youtube Video
   - url: https://noembed.com/embed?url=https://www.youtube.com/watch?v=3wmqu4LzuoU
   - response:
   ```json
   {
     "author_name": ...,
     "author_url": ...,
     "html": "<iframe ...></iframe>",
     ...
   }
   ```
   - html:
   ```html
   {$data.html}
   ```
   <div align="center"><img src="demo/images/youtube.png"></div>
   </br>


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap
- [x] Allow accessing fetched object using `{obj-path}` in HTML
- [x] Add advanced options for fetching URLs
- [x] Add Extension Icon
- [x] Allow Ordering
- [x] Add Export & Import cards function
- [x] Allow simple JS injection without using eval
- [ ] Extend statement evalutaion function pools to all functions in `window` object
- [ ] Allow injecting "Referer" to request headers
- [ ] Add template URLs and HTMLs

See the [open issues](https://github.com/SteinsFu/api-fetcher-chrome-extension/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. Please create a new branch and do not work on master branch directly.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Since `libs` folder has too many files (especially Bootstrap icons), I suggest developers to do the followings for faster git commit:
```sh
cd libs/bootstrap-icons-1.8.0 
git update-index --assume-unchanged $(git ls-files | tr '\n' ' ')

cd ../bootstrap-5.1.3-dist
git update-index --assume-unchanged $(git ls-files | tr '\n' ' ')

cd ..
git update-index --assume-unchanged jquery-3.6.0.min.js 
```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
This readme doc is modified from:
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/SteinsFu/api-fetcher-chrome-extension.svg?style=for-the-badge
[contributors-url]: https://github.com/SteinsFu/api-fetcher-chrome-extension/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/SteinsFu/api-fetcher-chrome-extension.svg?style=for-the-badge
[forks-url]: https://github.com/SteinsFu/api-fetcher-chrome-extension/network/members
[stars-shield]: https://img.shields.io/github/stars/SteinsFu/api-fetcher-chrome-extension.svg?style=for-the-badge
[stars-url]: https://github.com/SteinsFu/api-fetcher-chrome-extension/stargazers
[issues-shield]: https://img.shields.io/github/issues/SteinsFu/api-fetcher-chrome-extension.svg?style=for-the-badge
[issues-url]: https://github.com/SteinsFu/api-fetcher-chrome-extension/issues
[license-shield]: https://img.shields.io/github/license/SteinsFu/api-fetcher-chrome-extension.svg?style=for-the-badge
[license-url]: https://github.com/SteinsFu/api-fetcher-chrome-extension/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png