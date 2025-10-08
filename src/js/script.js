// =====================================================
// PC Express – script.js (global pour toutes les pages)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------
  // MENU BURGER (mobile) + overlay + animation des barres
  // ---------------------------------------------------
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const burgerLines = burgerBtn ? burgerBtn.querySelectorAll("span") : [];

  if (burgerBtn && mobileMenu && mobileOverlay) {
    const closeMobileMenu = () => {
      mobileMenu.classList.add("-translate-x-full");
      mobileOverlay.classList.add("hidden");
      if (burgerLines.length >= 3) {
        burgerLines[0].classList.remove("rotate-45", "translate-y-1.5");
        burgerLines[1].classList.remove("opacity-0");
        burgerLines[2].classList.remove("-rotate-45", "-translate-y-1.5");
      }
    };

    burgerBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("-translate-x-full");
      mobileOverlay.classList.toggle("hidden");

      if (burgerLines.length >= 3) {
        burgerLines[0].classList.toggle("rotate-45");
        burgerLines[0].classList.toggle("translate-y-1.5");
        burgerLines[1].classList.toggle("opacity-0");
        burgerLines[2].classList.toggle("-rotate-45");
        burgerLines[2].classList.toggle("-translate-y-1.5");
      }
    });

    mobileOverlay.addEventListener("click", closeMobileMenu);
  }

  // ---------------------------------------------------
  // MODAL RDV (ouvrir / fermer / clic hors contenu)
  // ---------------------------------------------------
  const openBtn = document.getElementById("openModal");
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");

  function openModal() {
    if (!modal || !modalContent) return;
    modal.classList.remove("opacity-0", "pointer-events-none");
    modalContent.classList.remove("scale-95");
    modalContent.classList.add("scale-100");
  }

  function closeModal() {
    if (!modal || !modalContent) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    modalContent.classList.add("scale-95");
    modalContent.classList.remove("scale-100");
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ---------------------------------------------------
  // TOAST (succès / erreur) — id="toast" présent sur toutes les pages
  // ---------------------------------------------------
  const toast = document.getElementById("toast");
  function showToast(msg, isError = false) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("bg-blue-900", "bg-red-600");
    toast.classList.add(isError ? "bg-red-600" : "bg-blue-900");
    toast.classList.remove("hidden", "opacity-0", "-translate-y-5");
    toast.classList.add("opacity-100", "translate-y-0");
    setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "-translate-y-5");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 5000);
  }

  // ---------------------------------------------------
  // FORMULAIRE RDV (Google Apps Script) – id="contactForm"
  // ---------------------------------------------------
  const form = document.getElementById("contactForm");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const phoneField = document.getElementById("phone");
  const dateField = document.getElementById("date");
  const messageField = document.getElementById("message");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!nameField.value.trim())
        return showToast("⚠️ Merci d’indiquer votre nom", true);
      if (!emailField.value.trim())
        return showToast("⚠️ Merci d’indiquer votre email", true);
      if (!phoneField.value.trim())
        return showToast("⚠️ Merci d’indiquer votre téléphone", true);
      if (!dateField.value.trim())
        return showToast("⚠️ Merci de choisir une date", true);
      if (!messageField.value.trim())
        return showToast("⚠️ Merci de décrire votre problème", true);

      const formData = new FormData();
      formData.append("name", nameField.value);
      formData.append("email", emailField.value);
      formData.append("phone", phoneField.value);
      formData.append("date", dateField.value);
      formData.append("message", messageField.value);

      fetch(
        "https://script.google.com/macros/s/AKfycbynfPsM6nElRiOlqJdM1o61bdU--mEpzdEsel-zaPmiIhrdf37AD2Usjg_c56TZmWD8BQ/exec",
        { method: "POST", body: formData }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showToast("✅ Votre demande a bien été envoyée !");
            form.reset();
            closeModal();
            if (data.reservedDates) initFlatpickr(data.reservedDates);
          } else {
            showToast("❌ Erreur lors de l’envoi: " + data.error, true);
          }
        })
        .catch((err) => console.error("Erreur Google Apps Script:", err));
    });
  }

  // ---------------------------------------------------
  // FLATPICKR (champ date du RDV) + placeholder jj/mm/aa + légende
  // ---------------------------------------------------
  function initFlatpickr(reservedDates = []) {
    if (!window.flatpickr || !document.querySelector("#date")) return;

    const fp = flatpickr("#date", {
      dateFormat: "Y-m-d", // interne
      altInput: true, // input visible
      altFormat: "d/m/Y", // JJ/MM/AA
      minDate: "today",
      disable: reservedDates,
      locale: "fr",
      allowInput: true,
    });

    if (fp && fp.altInput) {
      fp.altInput.placeholder = "jj/mm/aa"; // conserver le placeholder
    }

    // Légende dispo/réservé
    let legend = document.getElementById("calendarLegend");
    if (!legend) {
      legend = document.createElement("p");
      legend.id = "calendarLegend";
      legend.className = "text-sm text-gray-500 mt-2 text-center";
      legend.innerHTML = "⚪ Disponible &nbsp;&nbsp; 🔴 Réservé";
      document.querySelector("#date").parentNode.appendChild(legend);
    }
  }

  // Charger les dates réservées au démarrage (si le champ #date existe)
  if (document.getElementById("date")) {
    fetch(
      "https://script.google.com/macros/s/AKfycbynfPsM6nElRiOlqJdM1o61bdU--mEpzdEsel-zaPmiIhrdf37AD2Usjg_c56TZmWD8BQ/exec"
    )
      .then((res) => res.json())
      .then((data) => initFlatpickr(data.reservedDates || []))
      .catch((err) => {
        console.error("Erreur récupération dates réservées:", err);
        initFlatpickr([]);
      });
  }

  // ---------------------------------------------------
  // FORMULAIRE TARIFS / DEVIS (EmailJS) – id="tarifsForm"
  // ---------------------------------------------------
  const tarifsForm = document.getElementById("tarifsForm");
  if (tarifsForm) {
    tarifsForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const services = Array.from(
        tarifsForm.querySelectorAll("input[name='service']:checked")
      )
        .map((cb) => cb.value)
        .join(", ") || "Non précisé";

      const formData = {
        firstname: tarifsForm.firstname?.value || "",
        lastname: tarifsForm.lastname?.value || "",
        email: tarifsForm.email?.value || "",
        phone: tarifsForm.phone?.value || "",
        services,
        message: tarifsForm.message?.value || "",
      };

      // ⚠️ Utilise tes IDs EmailJS (déjà init côté HTML)
      emailjs
        .send("service_14beauu", "template_t6gflsr", formData)
        .then(() => {
          showToast("✅ Votre demande de devis a bien été envoyée !");
          tarifsForm.reset();
        })
        .catch((err) => {
          console.error("Erreur EmailJS:", err);
          showToast("❌ Erreur lors de l’envoi", true);
        });
    });
  }

  // ---------------------------------------------------
  // MODAL EXPLICATIF (cartes .service-item → #serviceModal)
  // ---------------------------------------------------
  const items = document.querySelectorAll(".service-item");
  const serviceModal = document.getElementById("serviceModal");
  const serviceTitle = document.getElementById("serviceTitle");
  const serviceContent = document.getElementById("serviceContent");
  const closeServiceModal = document.getElementById("closeServiceModal");

  if (items && serviceModal && serviceTitle && serviceContent) {
    items.forEach((item) => {
      item.addEventListener("click", () => {
        serviceTitle.textContent = item.dataset.title || "";
        // innerHTML pour garder <b>, <ul>… passés dans data-content
        serviceContent.innerHTML = item.dataset.content || "";
        serviceModal.classList.remove("hidden");
        serviceModal.classList.add("flex");
      });
    });

    if (closeServiceModal) {
      closeServiceModal.addEventListener("click", () => {
        serviceModal.classList.add("hidden");
        serviceModal.classList.remove("flex");
      });
    }

    serviceModal.addEventListener("click", (e) => {
      if (e.target === serviceModal) {
        serviceModal.classList.add("hidden");
        serviceModal.classList.remove("flex");
      }
    });
  }

  // ---------------------------------------------------
  // SMOOTH SCROLL vers les sections de conseils (ancres #conseil-…)
  // ---------------------------------------------------
  document.querySelectorAll("a[href^='#conseil-']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ---------------------------------------------------
  // BOUTON "Retour en haut" (expose la fonction globalement)
  // ---------------------------------------------------
  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------------------------------------------
  // STICKY ASIDE (conseils) – évite de recouvrir le footer
  // ---------------------------------------------------
  // Si l'aside sticky est dans le même wrapper que les sections, ça suffit.
  // Sinon, on corrige quand le footer entre dans le viewport.
  const stickyAside = document.querySelector("aside.sticky");
  const footer = document.querySelector("section.flex.justify-center");
  if (stickyAside && footer) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stickyAside.style.position = "absolute";
          stickyAside.style.bottom = "120px";
        } else {
          stickyAside.style.position = "";
          stickyAside.style.bottom = "";
        }
      },
      { threshold: 0 }
    );
    obs.observe(footer);
  }
});

