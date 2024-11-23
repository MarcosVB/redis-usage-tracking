document.addEventListener("DOMContentLoaded", function () {
  fetch("/usage-data")
    .then((response) => response.json())
    .then((data) => {
      const timestamps = data.map((d) =>
        new Date(parseInt(d.message.timestamp)).toISOString()
      );
      const actions = data.map((d) => d.message.action);

      const ctx = document.getElementById("usageChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: timestamps,
          datasets: [
            {
              label: "Actions",
              data: actions.map((action) => 1), // Assuming the action counts as 1 event per action
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
    });
});
