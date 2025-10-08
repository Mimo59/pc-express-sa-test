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
  // TOAST (succès / erreur)
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
  // FORMULAIRE RDV (EmailJS) – id="contactForm"
  // ---------------------------------------------------
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const params = {
        from_name: contactForm.name?.value || "",
        from_email: contactForm.email?.value || "",
        phone: contactForm.phone?.value || "",
        date: contactForm.date?.value || "",
        message: contactForm.message?.value || ""
      };

      emailjs.send("service_14beauu", "template_89sq0xi", params)
        .then(() => {
          showToast("✅ Votre demande de RDV a bien été envoyée !");
          contactForm.reset();
          closeModal();

          emailjs.send("service_14beauu", "template_accuse_rdv", params)
      .catch(err => console.error("Erreur accusé RDV:", err));
        })
        .catch((err) => {
          console.error("Erreur EmailJS RDV:", err);
          showToast("❌ Erreur lors de l’envoi du RDV", true);
        });
    });
  }

  // ---------------------------------------------------
  // FLATPICKR (champ date du RDV) + placeholder
  // ---------------------------------------------------
  function initFlatpickr(reservedDates = []) {
    if (!window.flatpickr || !document.querySelector("#date")) return;

    const fp = flatpickr("#date", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      minDate: "today",
      disable: reservedDates,
      locale: "fr",
      allowInput: true,
    });

    if (fp && fp.altInput) {
      fp.altInput.placeholder = "jj/mm/aa";
    }

    let legend = document.getElementById("calendarLegend");
    if (!legend) {
      legend = document.createElement("p");
      legend.id = "calendarLegend";
      legend.className = "text-sm text-gray-500 mt-2 text-center";
      legend.innerHTML = "⚪ Disponible &nbsp;&nbsp; 🔴 Réservé";
      document.querySelector("#date").parentNode.appendChild(legend);
    }
  }

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

      const params = {
        firstname: tarifsForm.firstname?.value || "",
        lastname: tarifsForm.lastname?.value || "",
        email: tarifsForm.email?.value || "",
        phone: tarifsForm.phone?.value || "",
        services,
        message: tarifsForm.message?.value || "",
      };

      emailjs.send("service_14beauu", "template_t6gflsr", params)
        .then(() => {
          showToast("✅ Votre demande de devis a bien été envoyée !");
          tarifsForm.reset();

          // Accusé de réception côté client
    emailjs.send("service_14beauu", "template_accuse_rdv", params)
      .catch(err => console.error("Erreur accusé RDV:", err));
    
        })
        .catch((err) => {
          console.error("Erreur EmailJS Devis:", err);
          showToast("❌ Erreur lors de l’envoi du devis", true);
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
  // SMOOTH SCROLL vers les sections de conseils
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
  // BOUTON "Retour en haut"
  // ---------------------------------------------------
  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------------------------------------------
  // STICKY ASIDE (conseils)
  // ---------------------------------------------------
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


