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
            console.log(response);
            $('.emptydiv').empty();

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

    $(document).on("click", '.deleteButton', function () {
        $(this).closest('.brewList').remove();
        var brew = $(this).closest('.brewList').find('#result').text();
        console.log(brew);
        removeFromArray(brew);
    });

    function removeFromArray(br){
        var arrayIndex = wishes.findIndex(x => x.brewery === br);
        if (arrayIndex > -1){
            wishes.splice(arrayIndex, 1);
            localStorage.setItem("wish", JSON.stringify(wishes));
        }
    }

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
    
    //pagination for results
    //buttons for types of breweries, micro, brewpub
    //search by name
    //needs to be rewritten to pass zip code to brewery finder/brew finder use zip not city
    //need it to not update brewery list on click of line item
    //see if adding too many maps each time, instead update exisitng map
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

                function success(pos) {
                    lat = pos.coords.latitude;
                    long = pos.coords.longitude;
                    onLanding(lat, long, zoomLevel);
                    console.log("success")
                }

                function error(err) {
                    lat = 41.8781;
                    long = -87.6298;
                    onLanding(lat, long, zoomLevel);
                    console.log("fail");
                    console.warn(`ERROR(${err.code}): ${err.message}`);
                  }
                  navigator.geolocation.getCurrentPosition(success, error)

        } else{
            var address = nameBrewery.replace(/[\/\\#,+()$~%'":*?<>{}]/g, '');
            queryURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + " " + city + '.json?&access_token=' + key;
            console.log(queryURL);
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

    function onLanding(la, lo, zo){
        mapboxgl.accessToken = key;
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lo, la],
            zoom: zo // starting zoom
        });
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());
        queryURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lo + ","+ la + '.json?&access_token=' + key;;

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                console.log(response);
                city = response.features[3].text;
                $('.currentCity').html(city);
                getBreweries(city);
            })
    }
 

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
        var brewery = $(this).closest('#result').text();
        console.log(brewery);
        var checked = $('input:checked');
        if(checked.length !== 0){
            var wishCity = $(this).closest('.brewList').find('#wishCity').text();
            console.log(wishCity);
            $('.currentCity').html(wishCity);
            getaddressLocation(addy, wishCity, false);
            } else{
                getaddressLocation(brewery, city, false);
            }
        
});
});