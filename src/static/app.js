document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;


          // build participants list (show friendly message when empty)
          const participants = details.participants || [];
          let participantsHtml = "";
          if (participants.length) {
            const ul = document.createElement("ul");
            ul.className = "participants-list";
            participants.forEach((p) => {
              const li = document.createElement("li");
              const span = document.createElement("span");
              span.className = "participant-email";
              span.textContent = p;

              const btn = document.createElement("button");
              btn.className = "unregister";
              btn.setAttribute("data-activity", name);
              btn.setAttribute("data-email", p);
              btn.title = "Unregister";
              btn.textContent = "✖";

              li.appendChild(span);
              li.appendChild(btn);
              ul.appendChild(li);
            });

            participantsHtml = ul.outerHTML;
          } else {
            participantsHtml = `<p class="participants-empty">No participants yet</p>`;
          }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <div class="participants-title">Participants</div>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
      // attach event handler for unregister buttons (event delegation)
      activitiesList.addEventListener("click", async (e) => {
        if (e.target && e.target.matches(".unregister")) {
          const activity = e.target.getAttribute("data-activity");
          const email = e.target.getAttribute("data-email");
          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
              { method: "DELETE" }
            );
            const result = await response.json();
            const messageDiv = document.getElementById("message");
            if (response.ok) {
              messageDiv.textContent = result.message;
              messageDiv.className = "message success";
            } else {
              messageDiv.textContent = result.detail || "Failed to unregister";
              messageDiv.className = "message error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => messageDiv.classList.add("hidden"), 4000);
            // refresh activities
            fetchActivities();
          } catch (err) {
            console.error("Error unregistering:", err);
          }
        }
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        // refresh activities to show the new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
