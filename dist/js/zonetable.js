var table = $('#zone').DataTable( {
	   	       "language": {
				"info": "",
		},
	   "bPaginate": false,
	   "searching": false,
        "ajax": {
            "url": "http://eviothings.in:1880/eztraxes",
			"type" : "GET",
            "dataSrc": "zoneDetails", 
        },
        "columns": [
		{ "data": "zoneId" },
          { "data": "zoneName" },
			 { "data": "PersonsWithinZone" }
        ]
    } );