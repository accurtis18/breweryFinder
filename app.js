$(document).ready(function () {
    var city = '';
    var key = 'pk.eyJ1IjoiYWNjdXJ0aXMiLCJhIjoiY2thMjF1Y3JtMDdqMzNmbzV3aTE3ZWUybSJ9.cShGDmb0UQmaDdU3ur9tdQ';
    getaddressLocation("", city, true);

    function getBreweries(newCity) {
        city = newCity;
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

            if (response.length === 0) {
                $("#myModal").modal();
            }
            var i = 0;
            while (i < response.length && i < 10) {
                if (response[i].brewery_type === "planning") { i++; continue; };
                $('.emptydiv').append(`<li class="list-group-item brewList"><div class='name ${i}'><a href='#${response[i].name}' id='result'>${response[i].name}</a>
                <div class= "favoriteButton btn">Add To Wish List</div></div> 
                <div class='brewery_type'>${response[i].brewery_type}</div>
                <div class='street' id="addy">${response[i].street}</div>
                </li>`);
                i++
            }
        });
    };

    var wishes = [];

    $(document).on("click", '.favoriteButton', function () {
        var addy = $(this).closest('.brewList').find('#addy').text();
        var brew = $(this).closest('.brewList').find('#result').text();
        wishes.push({
            myCity: city,
            address: addy,
            brewery: brew
        })
        localStorage.setItem('wish', JSON.stringify(wishes));
    });

    var wishList = function () {
        var getWishes = JSON.parse(localStorage.getItem("wish"));

        if (getWishes !== null) {
            wishes = getWishes;
            for (wish of wishes) {
                $(".emptydiv").append(`<li class="list-group-item brewList"><div class='name'>
                <a href ='#${wish.brewery}' id='result'>${wish.brewery}</a>
                <div class= "deleteButton btn">Remove</div></div> 
                <div class='brewery_city' id='wishCity'>${wish.myCity}</div>
                <div class='street' id='addy'>${wish.address}</div></li>`);
            }
        }
    }

    $('.listSlider').on('click',function(){
        $('.emptydiv').html("");
        var checked = $('input:checked');
        if(checked.length === 0){
            $('.currentCity').html(city);
            getaddressLocation("", city, false);
        } else{
            wishList();
        } 
    });
    
    function getaddressLocation(nameBrewery, city, first) {
        var queryURL = "";
        var zoomLevel = 0;
        if(nameBrewery === ""){
            zoomLevel = 11;
        } else{
            zoomLevel = 15;
        }
        
        if(first){
            var lat = 0;
            var long = 0;
            console.log(navigator);
            navigator.geolocation.getCurrentPosition(position => {
                    lat = position.coords.latitude;
                    long = position.coords.longitude;
                            mapboxgl.accessToken = key;
                var map = new mapboxgl.Map({
                    container: 'map', // container id
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [long, lat],
                    zoom: zoomLevel // starting zoom
                });
                // Add zoom and rotation controls to the map.
                map.addControl(new mapboxgl.NavigationControl());

                queryURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + long + ","+ lat + '.json?proximity=-87.65,41.85&access_token=' + key;;
        
                    $.ajax({
                        url: queryURL,
                        method: "GET"
                    }).then(function (response) {
                        console.log(response);
                        city = response.features[3].text;
                        $('.currentCity').html(city);
                        getBreweries(city);
                    })

            })
        } else{
            queryURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + nameBrewery + " " + city + '.json?&access_token=' + key;
            console.log("This was called");
            $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            if (response.features.length === 0) {
                $("#myModal").modal();
                return;
            }
            $('.currentCity').html(city);
            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [response.features[0].geometry.coordinates[0], response.features[0].geometry.coordinates[1]], // starting position
                zoom: zoomLevel // starting zoom
            })
            // Add zoom and rotation controls to the map.
            map.addControl(new mapboxgl.NavigationControl());

            var marker = new mapboxgl.Marker()
                .setLngLat([response.features[0].geometry.coordinates[0], response.features[0].geometry.coordinates[1]])
                .addTo(map);
            
            var checked = $('input:checked');
            if(checked.length === 0){
                    getBreweries(city);
                }
            
        });
        }
    };

    function onSearch(){
        city = $('#searchBrewery').val();
        $('#searchBrewery').val("")
        getaddressLocation("", city.trim(), false);
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
        var addy = $(this).closest('.brewList').find('#addy').text();
        var checked = $('input:checked');
        if(checked.length !== 0){
            var wishCity = $(this).closest('.brewList').find('#wishCity').text();
            console.log(wishCity);
            $('.currentCity').html(wishCity);
            getaddressLocation(addy, wishCity, false);
            } else{
                getaddressLocation(addy, city, false);
            }
        
});
});