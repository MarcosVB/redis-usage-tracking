document.addEventListener("DOMContentLoaded", function () {
  const actionFilter = document.getElementById("actionFilter");
  actionFilter.addEventListener("change", fetchDataAndRenderChart);

  fetchDataAndRenderChart();

  function fetchDataAndRenderChart() {
    const action = actionFilter.value;
    const url = action ? `/usage-data?action=${action}` : "/usage-data";
    console.log(`Fetching data from: ${url}`);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        const timestamps = data.map((d) =>
          new Date(parseInt(d.message.timestamp)).toISOString()
        );
        const actions = data.map((d) => d.message.action);

        const ctx = document.getElementById("usageChart").getContext("2d");
        if (window.myChart) {
          window.myChart.destroy();
        }
        window.myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: timestamps,
            datasets: [
              {
                label: "Actions",
                data: actions.map(() => 1), // Assuming each action counts as 1 event per action
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Timestamp",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Actions",
                },
                beginAtZero: true,
              },
            },
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
});
