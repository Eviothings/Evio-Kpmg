$.ajax({
    url: "https://api.covid19india.org/state_district_wise.json",
    type: "GET",
    success: function (data1) {
        var obj = data1.Maharashtra.districtData.Pune;
        document.getElementById("Deceased").innerHTML = obj.deceased;
        document.getElementById("confirmed").innerHTML = obj.confirmed;
        document.getElementById("Hospitalized").innerHTML = obj.active;
        document.getElementById("Recovered").innerHTML = obj.recovered;
    }
});