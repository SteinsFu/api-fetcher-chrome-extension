<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



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
  <!-- <a href="https://github.com/SteinsFu/api-fetcher-chrome-extension">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h3 align="center">API Fetcher Chrome Extension</h3>

  <p align="center">
    A Chrome extension to fetch APIs in popup widget
    <br />
    <a href="https://github.com/SteinsFu/api-fetcher-chrome-extension">View Demo</a>
    ·
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
    <li><a href="#usage">Usage</a></li>
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

<p align="right">(<a href="#top">back to top</a>)</p>



### 3rd-Party Libraries

* [JQuery 3.6.0](https://code.jquery.com/jquery-3.6.0.min.js)
* [Bootstrap 5.1.3](https://getbootstrap.com/docs/5.1/getting-started/download/)
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

### Bootstrap 5 CSS & icons
We are using Bootstrap 5 css and icons. you can insert html with Bootstrap 5 css.
- Bootstrap doc: https://getbootstrap.com/docs/5.1/getting-started/introduction/
- Bootstrap icons: https://icons.getbootstrap.com/
### Examples
- url: https://openweathermap.org/data/2.5/onecall?lat=39.76&lon=-98.5&units=metric&appid=439d4b804bc8187953eb36d2a8c26a02
- html:
  ```html
  <p>Timezone: {timezone}</p>
  <p>Temperature: {current.temp} C</p>
  <p>Weather: {current.weather[0].description} </p>
  ```
<div align="center"><img src="demo/images/weather.png"></div>
</br>

- url: https://www.pixiv.net/ranking.php?format=json&content=illust
- html:
  ```html
  <img width="400" src="https://pximg.rainchan.win/img?img_id={contents[0].illust_id}">
  ```
<div align="center"><img src="demo/images/image.png"></div>
</br>


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap
- [x] Allow accessing fetched object using `{obj-path}` in HTML
- [x] Add advanced options for fetching URLs
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