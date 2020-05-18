$(document).ready(function () {
    getGeolocation();
    var city = '';

    console.log(coords);
    function getGeolocation() {
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": "https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/",
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "ip-geolocation-ipwhois-io.p.rapidapi.com",
                "x-rapidapi-key": "4160692450msh57c7f939866117fp13f0ccjsn2faf3ca7bcb3"
            }
        }).then(function (response) {
            city = response.city;
            getBreweries(response.city);

            mapboxgl.accessToken = 'pk.eyJ1IjoiYWNjdXJ0aXMiLCJhIjoiY2thMjF1Y3JtMDdqMzNmbzV3aTE3ZWUybSJ9.cShGDmb0UQmaDdU3ur9tdQ';
            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [response.longitude, response.latitude], // starting position
                zoom: 9 // starting zoom
            });
            // Add zoom and rotation controls to the map.
            map.addControl(new mapboxgl.NavigationControl());
        });
    };

    function getBreweries(city) {
        console.log(city);
        var queryURL = 'https://api.openbrewerydb.org/breweries?by_city=' + city;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            $('.emptydiv').empty();
            $('.name').empty();
            $('.brewery_type').empty();
            $('.street').empty();
            $('.favoriteButton').empty();

            console.log(response);

            if (response.length === 0) {
                $("#myModal").modal();
            }
            var i = 0;
            while (i < response.length && i < 10) {
                if (response[i].brewery_type === "planning") { i++; continue; };
                $('.emptydiv').append(`<li class="list-group-item brewList"><div class='name ${i}'><a href='#${response[i].name}' id='${response[i].name}'>
                ${response[i].name}</a><div class= "favoriteButton btn btn-primary">Add To Wish List</div></div> 
                <div class='brewery_type'>${response[i].brewery_type}</div>
                <div class='street'>${response[i].street}</div>
                </li>`);
                i++
            }
        });
    };

    var wishes = [];

    $(document).on("click", '.favoriteButton', function () {
        var previousElements = $(this).prevAll();
        console.log(previousElements);
        var saveCity = city;
        var wish = $(previousElements[2]).children().first().text();
        var addy = previousElements[0].innerText;
        wishes.push({
            myCity: saveCity,
            address: addy,
            brewery: wish
        })
        localStorage.setItem('wish', JSON.stringify(wishes));
        console.log(wishes);
    });
    var wishList = function () {
        console.log('wishList');
        var getWishes = JSON.parse(localStorage.getItem("wish"));

        if (getWishes !== null) {
            wishes = getWishes;
            for (wish of wishes) {
                $(".emptydiv2").append(`<a href ='#${wish.brewery}' id='${wish.brewery}'><div> ${wish.brewery} </div></a><div class = 'brewery_city'>   ${wish.myCity}   </div>`);
            }
        }
    }
    
    function getaddressLocation(nameBrewery, city) {
        var queryURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + nameBrewery + '.json?proximity=-87.65,41.85&access_token=pk.eyJ1IjoiY2FybG9zcmVtYTIiLCJhIjoiY2s5em5zZjB2MGN2bTNncDYyM2Ruc2FyZSJ9.piNzfWJ9-dRIsVM3le57gg';

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //console.log(response);

            $('body').append('<div>' + response.features[0].geometry.coordinates[0] + '</div>' + '  <div>' + response.features[0].geometry.coordinates[1] + '   </div>');
            mapboxgl.accessToken = 'pk.eyJ1IjoiYWNjdXJ0aXMiLCJhIjoiY2thMjF1Y3JtMDdqMzNmbzV3aTE3ZWUybSJ9.cShGDmb0UQmaDdU3ur9tdQ';

            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [response.features[0].geometry.coordinates[0], response.features[0].geometry.coordinates[1]], // starting position
                zoom: 13 // starting zoom
            });
            // Add zoom and rotation controls to the map.
            map.addControl(new mapboxgl.NavigationControl());
        });
    };

    function onSearch(){
        var city = $('#searchBrewery').val();
            getBreweries(city.trim());
    }

    $('#searchBrewery').keypress(function (e) {
        if (e.which == 13) {
            onSearch();
            return false;
        };
    });

    $('#search').on('click', function () {
        onSearch();
    });

    $('.emptydiv').on("click", '#result', function(){
        // var brewery = $(this).closest('#result').text();
        var addy = $(this).closest('.resultItem').find("div[id='addy'").text();
        getaddressLocation(addy, city);
});
});