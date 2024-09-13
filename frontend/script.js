(function() {
    const searchBox = document.querySelector(".search input");
    const searchBtn = document.querySelector(".search button");
    const weatherHourly = document.querySelector(".weather-by-time");
    const weatherDaily = document.querySelector(".weather-by-days");
    const card = document.querySelector(".card");
    const shareDiv = document.querySelector(".shareDiv");

    // current time convert
    const date = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    const currentTime = `${day}, ${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`


    // shareDiv logic
    document.querySelector(".share").addEventListener("click", function(event) {
        event.stopPropagation();
        document.querySelector(".popup-menu").classList.add("hidden");
        card.classList.add("blur");
        shareDiv.classList.remove("hidden");

        document.body.addEventListener("click", function(event) {
            if (!shareDiv.contains(event.target)) {
                card.classList.remove("blur");
                shareDiv.classList.add("hidden");
            }
        })
    })

    document.getElementById("close").addEventListener("click", function() {
        card.classList.remove("blur");
        shareDiv.classList.add("hidden");
    })


    document.getElementById("share-facebook").addEventListener("click", function() {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href) + '&t=' + encodeURIComponent('Check out the weather forecast!'));
    })

    document.getElementById("share-twitter").addEventListener("click", function() {
        window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent('Check out the weather forecast!'));
    })

    curr();
    
    // get user's current location if navigator is enabled
    function curr() {
        if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    fetchCurrent(latitude, longitude);
            }, function(error) {
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  console.log("denied the request");
                  break;
                case error.POSITION_UNAVAILABLE:
                  console.log("Location information is unavailable");
                  break;
              }
            });
        }
    }

    // make a request to backend to fetch info
    async function fetchAPI(obj) {
        try {
            const res = await fetch("/api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj),
            })

            const data = await res.json();
            return data;
        } catch (err) {
            console.error(err);
        }
    }

    // user's current time
    async function fetchCurrent(latitude, longitude) {
        const data = await fetchAPI({
            latitude,
            longitude,
        })

        const weatherImg = document.querySelector(".weather-icon");

        for (let i = 0; i < savedLocations.length; i++) {
            if (data.name == savedLocations[i]) {
                document.getElementById("saveLocation").classList.remove("ri-bookmark-line");
                document.getElementById("saveLocation").classList.add("ri-bookmark-fill");
            }
        }
        
        // you can make a function out of this!
        if (document.getElementById("system").value === 'metric') {
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
            document.getElementById("feelsLike").innerHTML = "Feels like " + data.main["feels_like"] + " °C";
            document.getElementById("dateID").innerHTML = currentTime;
        } else if (document.getElementById("system").value === 'imperial') {
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(Math.round(data.main.temp) * (9/5)) + 32 + "°F";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = Math.round(data.wind.speed * 0.621371) + " mph";
            document.getElementById("feelsLike").innerHTML = "Feels like " + Math.round(data.main["feels_like"] * 0.621371) + " °F";
            document.getElementById("dateID").innerHTML = currentTime;
        }

        const time = currentTime.split(" ")[1];
        const ampm = currentTime.split(" ")[2];
        changeBg(time, ampm);

        checkForImg(data.weather[0].main, weatherImg);
        sunTimes(data);
        hourlyForecast(data.name);

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
    }

    // get weather based on user's input
    async function checkCurrentWeather(city) {
        const data = await fetchAPI({
            city,
        })

        const weatherImg = document.querySelector(".weather-icon");

        // not checking for status here
        // if (res.status == 404) {
        //     document.querySelector(".error").style.display = "block";
        //     document.querySelector(".weather").style.display = "none";
        // }

        for (let i = 0; i < savedLocations.length; i++) {
            if (data.name === savedLocations[i]) {
                document.getElementById("saveLocation").classList.remove("ri-bookmark-line");
                document.getElementById("saveLocation").classList.add("ri-bookmark-fill");
            } else {
                document.getElementById("saveLocation").classList.add("ri-bookmark-line");
                document.getElementById("saveLocation").classList.remove("ri-bookmark-fill");
            }
        }

        if (city == '') {
            curr();
        }

        if (document.getElementById("system").value === 'metric') {
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
            document.getElementById("feelsLike").innerHTML = "Feels like " + data.main["feels_like"] + " °C";
            document.getElementById("dateID").innerHTML = currentTime;
        } else if (document.getElementById("system").value === 'imperial') {
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(Math.round(data.main.temp) * (9/5)) + 32 + "°F";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = Math.round(data.wind.speed * 0.621371) + " mph";
            document.getElementById("feelsLike").innerHTML = "Feels like " + Math.round(data.main["feels_like"] * 0.621371) + " °F";
            document.getElementById("dateID").innerHTML = currentTime;
        }
        
        sunTimes(data);

        checkForImg(data.weather[0].main, weatherImg);

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";

        return [data.weather[0].main, data.main.temp];
    }

    searchBtn.addEventListener("click", function() {
        weatherHourly.innerHTML = '';
        weatherDaily.innerHTML = '';
        checkCurrentWeather(searchBox.value);
        hourlyForecast(searchBox.value);
        searchBox.value = " ";
    })
    
    // hourly forecast
    async function hourlyForecast(city) {
        const data = await fetchAPI({
            city,
            forecast: true,
        })

        for (let i = 0; i < 12; i++) {
            displayHourly(data.list[i]);
        }

        const arr = [];
        for (let i = 0; i < 40; i++) {
            arr.push(data.list[i]["dt_txt"]);
        }

        const result = arr.reduce((acc, date) => {
            const day = date.substring(0, 10); // the day part
            const hour = parseInt(date.substring(11, 13)); // the hour part
           
            if (!acc[day]) {
                acc[day] = {};
            }

            return acc;
        }, {});
        
        for (let res in result) {
            for (let i = 0; i < 40; i++) {
                if (res == (data.list[i]["dt_txt"].split(" "))[0]) {
                    result[res] = {
                        max: data.list[i].main["temp_max"],
                        min: data.list[i].main["temp_min"],
                        pic: data.list[i].weather[0].main,
                        day: data.list[i]["dt_txt"],
                    }
                }
            }
        }

        for (let i = 0; i < 39; i++) {
            // displayDaily(,datalist[0=-result);
        }


        for (let res in result) {
            displayDaily(res, result[res]);
        }       
    }

    // sunrise, sunset
    function sunTimes(item) {
        const sunrise = epochToCurrentTime(item.sys.sunrise).split(" ")[1].split(":")[0] + ":" + epochToCurrentTime(item.sys.sunrise).split(" ")[1].split(":")[1];
        const sunset = epochToCurrentTime(item.sys.sunset).split(" ")[1].split(":")[0] + ":" + epochToCurrentTime(item.sys.sunset).split(" ")[1].split(":")[1];

        const sunriseDiv = document.createElement("div");
        const sunsetDiv = document.createElement("div");
        const sunriseImg = document.createElement("img");
        const sunsetImg = document.createElement("img");
        const sunriseSpan = document.createElement("span");
        const sunsetSpan = document.createElement("span");
        const mainDiv = document.querySelector(".sunTimes");

        mainDiv.innerHTML = ""
        sunriseSpan.innerHTML = `<p>Sunrise</p>` + sunrise;
        sunsetSpan.innerHTML = `<p>Sunset</p>` + sunset;

        sunriseImg.src = 'img/sunrise.png';
        sunsetImg.src = 'img/sunrise.png';

        sunriseDiv.appendChild(sunriseSpan);
        sunriseDiv.appendChild(sunriseImg);
        sunsetDiv.appendChild(sunsetSpan);
        sunsetDiv.appendChild(sunsetImg);

        mainDiv.appendChild(sunriseDiv);
        mainDiv.appendChild(sunsetDiv);
    }

    // display hourly data
    function displayHourly(item) {
        const div = document.createElement("div");
        const time = document.createElement("h1");
        const img = document.createElement("img");
        const temp = document.createElement("h2");
        
        checkForImg(item.weather[0].main, img);

        // extract time
        const parts = item["dt_txt"].split(" ");
        const timePart = parts[1].split(":");
        const hour = parseInt(timePart[0]);

        time.textContent = hour > 12 ? hour + " PM" : hour + " AM" ;

        if (document.getElementById("system").value === 'metric') {
            temp.textContent = Math.round(item.main.temp) + "°C";
            
        } else if (document.getElementById("system").value === 'imperial') {
            temp.textContent = Math.round(Math.round(item.main.temp) * (9/5)) + 32 + "°F";
        }
        
        div.appendChild(time);
        div.appendChild(img);
        div.appendChild(temp);
        weatherHourly.appendChild(div);
    }

    function displayDaily(date, value) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todaysDate = new Date();
        const formattedDate = `${todaysDate.getFullYear()}-${String(todaysDate.getMonth() + 1).padStart(2, '0')}-${String(todaysDate.getDate()).padStart(2, '0')}`;
        
        function getDayOfWeek(txt) {
            const date = new Date(txt);
        
            return days[date.getDay()];
        }

        let currentDay = getDayOfWeek(date);
    
        const div = document.createElement("div");
        const smallDiv = document.createElement("div");
        const daY = document.createElement("h1");
        const img = document.createElement("img");
        const minTemp = document.createElement("span");
        const maxTemp = document.createElement("span");
        const tempDiv = document.createElement("div");

        checkForImg(value.pic, img);

        if (document.getElementById("system").value === 'metric') {
            maxTemp.textContent = Math.round(value.max) + "°";
            let min = Math.round(Math.round(value.max) - (Math.round(value.max) * 40) / 100);
            minTemp.textContent = min + "°";
        } else {
            maxTemp.textContent = Math.round(Math.round(value.max) * (9/5)) + 32 + "°";
            let min = Math.round(Math.round(Math.round(Math.round(value.max) * (9/5)) + 32) - (Math.round(Math.round(Math.round(value.max) * (9/5)) + 32) * 40) / 100);
            minTemp.textContent = min + "°";
        }

        if (date == formattedDate) {
            daY.textContent = "Today";
            div.classList.add("today");
        } else {
            daY.textContent = currentDay;
        }

        smallDiv.appendChild(img);
        smallDiv.appendChild(tempDiv);
        tempDiv.appendChild(maxTemp);
        tempDiv.appendChild(minTemp);

        smallDiv.classList.add("smallDivClass");
        div.classList.add("dailyDiv");
        tempDiv.classList.add("tempDiv");

        div.appendChild(daY);
        div.appendChild(smallDiv);

        weatherDaily.appendChild(div);
    }

    // open menu
    document.getElementById("menu").addEventListener("click", function() {
        document.querySelector(".popup-menu").classList.remove("hidden");

        document.querySelector(".locations").innerHTML = '';
        document.querySelector(".favorite-locations").innerHTML = '';

        for (let i = 0; i < savedLocations.length; i++) {
            displayLocations(savedLocations[i]);
        }

        for (let i = 0; i < favoriteLocations.length; i++) {
            displayFavorite(favoriteLocations[i]);
        }
    })    

    // save location
    document.getElementById("saveLocation").addEventListener("click", function() {
        if (this.classList.contains("ri-bookmark-line")) {
            this.classList.remove("ri-bookmark-line");
            this.classList.add("ri-bookmark-fill");
            saveLocation(document.querySelector(".city").textContent);
        } else {
            this.classList.add("ri-bookmark-line");
            this.classList.remove("ri-bookmark-fill");
            removeLocation(document.querySelector(".city").textContent);
        }
    })

    document.getElementById("closeNav").addEventListener("click", function() {
        document.querySelector(".popup-menu").classList.add("hidden");
    })

    const savedLocations = JSON.parse(localStorage.getItem("saved-locations")) || [];
    
    function saveLocation(location) {
        savedLocations.push(location);
        localStorage.setItem("saved-locations", JSON.stringify(savedLocations));
    }
    
    function removeLocation(location) {
        const index = savedLocations.indexOf(location);
        document.querySelector(".locations").innerHTML = "";
        if (index !== -1) {
            savedLocations.splice(index, 1);
            localStorage.setItem("saved-locations", JSON.stringify(savedLocations));
        }

        for (let i = 0; i < JSON.parse(localStorage.getItem("saved-locations")).length; i++) {
            displayLocations(JSON.parse(localStorage.getItem("saved-locations"))[i]);
        }
    }

    async function displayLocations(city) {
        document.querySelector(".favorite-locations").innerHTML = '';

        const div = document.createElement("div");
        const cityName = document.createElement("h2");
        const img = document.createElement("img");
        const temp = document.createElement("h2");
        const deleteLocation = document.createElement("i");
        const heart = document.createElement("i");
        const infoDiv = document.createElement("div");

        heart.classList.add("ri-heart-line");
        heart.classList.add("heart-class");
        deleteLocation.classList.add("ri-close-circle-line");
        div.classList.add("location");
        deleteLocation.classList.add("delete-location");

        if (favoriteLocations.includes(city)) {
            heart.classList.add("ri-heart-fill")
            heart.classList.remove("ri-heart-line")
        }

        const infoArr = await checkCurrentWeather(city);

        cityName.textContent = city;
        cityName.style.cursor = "pointer";

        if (document.getElementById("system").value === 'metric') {
            temp.textContent = Math.round(infoArr[1]) + "°C";
        } else {
            temp.textContent = Math.round(Math.round(infoArr[1]) * (9/5)) + 32 + "°F";
        }

        checkForImg(infoArr[0], img);

        infoDiv.appendChild(img);
        infoDiv.appendChild(temp);
        infoDiv.appendChild(deleteLocation);
        infoDiv.appendChild(heart);

        div.appendChild(cityName);
        div.appendChild(infoDiv);

        document.querySelector(".locations").appendChild(div);

        deleteLocation.addEventListener("click", function() {
            removeLocation(city);
        });

        heart.addEventListener("click", function() {
            if (this.classList.contains("ri-heart-line")) {
                this.classList.remove("ri-heart-line");
                this.classList.add("ri-heart-fill");
                saveFavorite(city);
            } else {
                this.classList.add("ri-heart-line");
                this.classList.remove("ri-heart-fill");
                removeFavorite(city);
            }
        })

        cityName.addEventListener("click", function() {
            weatherHourly.innerHTML = '';
            weatherDaily.innerHTML = '';

            document.querySelector(".popup-menu").classList.add("hidden");

            checkCurrentWeather(cityName.textContent);
            hourlyForecast(cityName.textContent);
            
            document.getElementById("saveLocation").classList.remove("ri-bookmark-line");
            document.getElementById("saveLocation").classList.add("ri-bookmark-fill");
        })
    }


    const favoriteLocations = JSON.parse(localStorage.getItem("favorite-locations")) || [];
    
    function saveFavorite(location) {
        document.querySelector(".favorite-locations").innerHTML = '';
        favoriteLocations.push(location);

        localStorage.setItem("favorite-locations", JSON.stringify(favoriteLocations));

        for (let i = 0; i < JSON.parse(localStorage.getItem("favorite-locations")).length; i++) {
            displayFavorite(JSON.parse(localStorage.getItem("favorite-locations"))[i]);
        }
    }
    
    function removeFavorite(location) {
        const index = favoriteLocations.indexOf(location);
        
        document.querySelector(".favorite-locations").innerHTML = "";
        if (index !== -1) {
            favoriteLocations.splice(index, 1);
            localStorage.setItem("favorite-locations", JSON.stringify(favoriteLocations));
        }

        for (let i = 0; i < favoriteLocations.length; i++) {
            displayFavorite(favoriteLocations[i]);
        }

    }

    async function displayFavorite(location) {
        const div = document.createElement("div");
        const cityName = document.createElement("h2");
        const img = document.createElement("img");
        const temp = document.createElement("h2");
        const infoDiv = document.createElement("div");

        div.classList.add("location");

        const infoArr = await checkCurrentWeather(location);

        cityName.textContent = location;
        
        if (document.getElementById("system").value === 'metric') {
            temp.textContent = Math.round(infoArr[1]) + "°C";
        } else {
            temp.textContent = Math.round(Math.round(infoArr[1]) * (9/5)) + 32 + "°F";
        }

        checkForImg(infoArr[0], img);

        infoDiv.appendChild(img);
        infoDiv.appendChild(temp);

        div.appendChild(cityName);
        div.appendChild(infoDiv);

        document.querySelector(".favorite-locations").appendChild(div);
        cityName.addEventListener("click", function() {
            weatherHourly.innerHTML = '';
            weatherDaily.innerHTML = '';
            document.querySelector(".popup-menu").classList.add("hidden");
            checkCurrentWeather(cityName.textContent);
            hourlyForecast(cityName.textContent);
            document.getElementById("saveLocation").classList.add("ri-bookmark-line");
            
        })
    }

    // change bg based on time
    function changeBg(time, ampm) {
        const hour = time.split(":")[0]
        
        if (ampm === 'am') {
            if (hour > 0 && hour < 6) {
                card.classList.add("morning");
            } else if (hour >= 6 && hour <= 12) {
                card.classList.add("afternoon");
            }
        } else if (ampm === 'pm') {
            if (hour > 0 && hour < 6) {
                card.classList.add("evening");
            } else if (hour >= 6 && hour <= 12) {
                card.classList.add("night");
            }
        }
    }

    // get the corresponding img for weather condition
    function checkForImg(weather, weatherImg) {
        switch(weather) {
            case 'Clouds':
                weatherImg.src = 'img/clouds.png';
                break;
            case 'Clear':
                weatherImg.src = 'img/clear.png';
                break;
            case 'Drizzle':
                weatherImg.src = 'img/drizzle.png';
                break;
            case 'Mist':
                weatherImg.src = 'img/mist.png';
                break;
            case 'Rain':
                weatherImg.src = 'img/rain.png';
                break;
            case 'Snow':
                weatherImg.src = 'img/snow.png';
                break;
        }
    }

    function epochToCurrentTime(epochTimeInSeconds) {
        const currentDate = new Date(epochTimeInSeconds * 1000);
    
        const year = currentDate.getFullYear();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);
    
        const hours = ('0' + currentDate.getHours()).slice(-2);
        const minutes = ('0' + currentDate.getMinutes()).slice(-2);
        const seconds = ('0' + currentDate.getSeconds()).slice(-2);
    
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    
    }
    
})();