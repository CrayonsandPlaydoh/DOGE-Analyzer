$(document).ready(function () {
    const API_URL = "https://www.federalregister.gov/api/v1/documents.json?per_page=100&order=newest";
    let agencyData = {};

    function fetchECFRData() {
        $.getJSON(API_URL, function (response) {
            if (!response || !response.results) {
                console.error("❌ API did not return valid data.");
                return;
            }

            let tempAgencyData = {};
            response.results.forEach(doc => {
                if (!doc.agencies || doc.agencies.length === 0) return;

                doc.agencies.forEach(agencyObj => {
                    let agency = agencyObj.name;
                    let wordCount = doc.abstract ? doc.abstract.split(" ").length : 0;
                    tempAgencyData[agency] = (tempAgencyData[agency] || 0) + wordCount;
                });
            });

            agencyData = tempAgencyData;
            populateAgencyDropdown(Object.keys(agencyData).sort());
            populateTable(Object.entries(agencyData));
        }).fail(function () {
            console.error("❌ API Request Failed.");
        });
    }

    function populateAgencyDropdown(agencies) {
        const agencyDropdown = $("#agencyDropdown");
        agencyDropdown.empty().append('<option value="all">-- Select All --</option>');

        agencies.forEach(agency => {
            agencyDropdown.append(new Option(agency, agency));
        });

        agencyDropdown.change(function () {
            let selectedAgencies = $(this).val();
            if (!selectedAgencies || selectedAgencies.includes("all")) {
                populateTable(Object.entries(agencyData));
            } else {
                let filteredData = Object.entries(agencyData)
                    .filter(([agency]) => selectedAgencies.includes(agency));
                populateTable(filteredData);
            }
        });
    }

    function populateTable(data) {
        const tbody = $("#dataTable tbody");
        tbody.empty();

        data.forEach(([agency, wordCount]) => {
            let row = `<tr><td>${agency}</td><td>${wordCount}</td></tr>`;
            tbody.append(row);
        });
    }

    $("#selectAll").click(function () {
        $("#agencyDropdown").val("all").change();
    });

    $("#agencyHeader").click(function () {
        let sortedData = Object.entries(agencyData).sort(([a], [b]) => a.localeCompare(b));
        populateTable(sortedData);
    });

    $("#wordCountHeader").click(function () {
        let sortedData = Object.entries(agencyData).sort(([, a], [, b]) => b - a);
        populateTable(sortedData);
    });

    fetchECFRData();
});

