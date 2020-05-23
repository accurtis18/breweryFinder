$(document).ready(function () {
    var city = '';
    var key = 'pk.eyJ1IjoiYWNjdXJ0aXMiLCJhIjoiY2thMjF1Y3JtMDdqMzNmbzV3aTE3ZWUybSJ9.cShGDmb0UQmaDdU3ur9tdQ';
    var breweries = [];
    var currentPage = 1;
    getaddressLocation("", city, true);

    function getBreweries(newCity) {
        breweries = [];
        currentPage = 1;
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
            while (i < response.length) {
                if (response[i].brewery_type === "planning") { i++; continue; };
                breweries.push(response[i]);
                i++
            }

            pagination(breweries, currentPage);
        });
    };

    function pagination(brew, currPage){
        $('.emptydiv').empty();
        $('.page').empty();
            console.log(brew);
            var x = 0;
            var pages = Math.ceil(brew.length / 5)
            if(currPage === 0 || currPage > pages){
                currentPage--;
                return;
            }
            console.log(pages);
            var showPage = 5 * currPage;
            var i = -5 + showPage;
            var y = 0;
            while (i < brew.length && y < 5) {
                $('.emptydiv').append(`<li class="list-group-item brewList"><div class='name ${i}'><a href='#${brew[i].name}' id='result'>${brew[i].name}</a></div> 
                <div class='brewery_type'>${brew[i].brewery_type}<div class= "favoriteButton btn">Add To Wish List</div></div>
                <div class='street' id="addy">${brew[i].street}</div>
                </li>`);
                y++;
                i++;
            }
            while(x < pages && x < 5){
                var clsNum = x - 1;
                var cls = '.previous' + clsNum;
                if(x === 0){
                    $('.emptydiv').append(`<nav class="pageBar" aria-label="...">
                    <ul class="pagination justify-content-center">
                        <li class="page-item">
                          <a class="page-link previous" href="#" tabindex="-1">Previous</a></li>
                          <li class="page-item previous${x} pgNm" aria-current="page"><a class="page-link" href="#">${(x +1)}<span class="sr-only">(current)</span></a></li>
                        <li class="page-item">
            <a class="page-link next" href="#">Next</a>
          </li>
        </ul>
      </nav>`)
                } else{
                    $(`<li class="page-item previous${x} pgNm"><a class="page-link" href="#">${(x +1)}</a></li>`).insertAfter(cls);
                }
                x++;
            }
    }

    $(document).on("click", '.next', function (){
        console.log("clicked next")
        currentPage++;
        pagination(breweries, currentPage);
        return false;
    });

    $(document).on("click", '.previous', function (){
        console.log("clicked next")
        currentPage--;
        pagination(breweries, currentPage);
        return false;
    });

    $(document).on("click", '.pgNm', function(){
        currentPage = parseInt($(this).closest(".pgNm").text());
        console.log(currentPage);
        pagination(breweries, currentPage);
        return false;
    })

    var wishes = [];

    $(document).on("click", '.favoriteButton', function () {
        var getWishes = JSON.parse(localStorage.getItem("wish"));
        wishes = getWishes;
        var addy = $(this).closest('.brewList').find('#addy').text();
        var brew = $(this).closest('.brewList').find('#result').text();
        var arrayIndex = wishes.findIndex(x => x.brewery == brew.trim());
        if (arrayIndex > -1) {
            return;
        }
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
                <a href ='#${wish.brewery}' id='result'>${wish.brewery}</a></div> 
                <div class='brewery_city' id='wishCity'>${wish.myCity}<div class= "deleteButton btn">Remove</div></div>
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
                    console.log(err);
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
        $('#searchBrewery').val("");
        $('.listSlider').prop("checked", false);
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