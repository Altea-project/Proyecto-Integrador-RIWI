import { navigate } from "../router/router.js";
import { userService } from "../services/userService.js";
import { setUser, getUser } from "../state/store.js";
import { PASSWORD_MIN_LENGTH } from "../utils/constants.js";
import horizontalLogoNegative from "../../assets/logos/horizontalLogoNegative.svg";

function lockIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M13.5 6H12.75V4.5C12.75 2.43 11.07 0.75 9 0.75C6.93 0.75 5.25 2.43 5.25 4.5V6H4.5C3.675 6 3 6.675 3 7.5V15C3 15.825 3.675 16.5 4.5 16.5H13.5C14.325 16.5 15 15.825 15 15V7.5C15 6.675 14.325 6 13.5 6ZM9 12.75C8.175 12.75 7.5 12.075 7.5 11.25C7.5 10.425 8.175 9.75 9 9.75C9.825 9.75 10.5 10.425 10.5 11.25C10.5 12.075 9.825 12.75 9 12.75ZM7.125 6V4.5C7.125 3.465 7.965 2.625 9 2.625C10.035 2.625 10.875 3.465 10.875 4.5V6H7.125Z" fill="currentColor"/>
  </svg>`;
}

function eyeIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 3.375C5.25 3.375 2.0475 5.8275 0.75 9.375C2.0475 12.9225 5.25 15.375 9 15.375C12.75 15.375 15.9525 12.9225 17.25 9.375C15.9525 5.8275 12.75 3.375 9 3.375ZM9 13.125C6.93 13.125 5.25 11.445 5.25 9.375C5.25 7.305 6.93 5.625 9 5.625C11.07 5.625 12.75 7.305 12.75 9.375C12.75 11.445 11.07 13.125 9 13.125ZM9 7.125C7.755 7.125 6.75 8.13 6.75 9.375C6.75 10.62 7.755 11.625 9 11.625C10.245 11.625 11.25 10.62 11.25 9.375C11.25 8.13 10.245 7.125 9 7.125Z" fill="currentColor"/>
  </svg>`;
}

function eyeOffIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.6 2.25L2.25 3.6L5.415 6.765C4.215 7.665 3.27 8.91 2.7 10.425C3.975 13.98 7.2 16.425 10.95 16.425C12.27 16.425 13.53 16.11 14.655 15.555L17.4 18.3L18.75 16.95L3.6 2.25ZM10.95 14.175C8.865 14.175 7.2 12.51 7.2 10.425C7.2 9.885 7.335 9.375 7.575 8.94L12.06 13.425C11.625 13.665 11.115 13.8 10.575 13.8V14.175H10.95Z" fill="currentColor"/>
    <path d="M10.95 5.625C13.035 5.625 14.7 7.29 14.7 9.375C14.7 10.035 14.535 10.65 14.25 11.19L16.44 13.38C17.61 12.315 18.495 10.95 18.975 9.375C17.7 5.82 14.475 3.375 10.725 3.375C9.405 3.375 8.145 3.69 7.02 4.245L9.21 6.435C9.75 6.165 10.365 5.985 10.95 5.985V5.625Z" fill="currentColor"/>
  </svg>`;
}

const ROLE_ROUTES = {
  admin: "/admin",
  coder: "/dashboard",
  instructor: "/tl",
  recruiter: "/recruiter",
};

export function ChangePasswordView() {
  return `
    <div class="relative min-h-screen flex items-center justify-center px-4 py-8 bg-bg-primary">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <div class="bg-bg-secondary border border-border-default rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div class="text-center mb-8">
            <div class="flex justify-center mb-5">
              <img src="${horizontalLogoNegative}" alt="Altea — logotipo horizontal" class="w-32 h-auto" />
            </div>
            <h1 class="font-heading text-xl font-semibold text-text-primary mt-2">
              Cambiá tu contraseña
            </h1>
            <p class="font-body text-text-secondary text-[15px] sm:text-base mt-2 leading-relaxed">
              Ingresaste con una contraseña temporal. Por seguridad, definí una nueva antes de continuar.
            </p>
          </div>

          <form id="change-password-form" novalidate>
            <div class="mb-4">
              <label for="new-password" class="font-body font-semibold text-xs text-text-primary uppercase tracking-wide mb-1.5 block">
                Nueva contraseña
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
                  ${lockIcon()}
                </div>
                <input
                  id="new-password"
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="w-full bg-[#1a1f2e] border border-border-default rounded-xl pl-10 pr-11 py-3 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                  aria-describedby="new-password-error"
                />
                <button
                  id="toggle-new-password"
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-tertiary hover:text-text-secondary transition-colors duration-200"
                  aria-label="Mostrar contraseña"
                  tabindex="-1"
                >
                  ${eyeIcon()}
                </button>
              </div>
              <p id="new-password-error" class="text-state-error text-xs font-body mt-1.5 hidden" role="alert"></p>
            </div>

            <div class="mb-2">
              <label for="confirm-password" class="font-body font-semibold text-xs text-text-primary uppercase tracking-wide mb-1.5 block">
                Confirmar nueva contraseña
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
                  ${lockIcon()}
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="w-full bg-[#1a1f2e] border border-border-default rounded-xl pl-10 pr-11 py-3 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                  aria-describedby="confirm-password-error"
                />
                <button
                  id="toggle-confirm-password"
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-tertiary hover:text-text-secondary transition-colors duration-200"
                  aria-label="Mostrar contraseña"
                  tabindex="-1"
                >
                  ${eyeIcon()}
                </button>
              </div>
              <p id="confirm-password-error" class="text-state-error text-xs font-body mt-1.5 hidden" role="alert"></p>
            </div>

            <p id="form-error" class="text-state-error text-sm font-body text-center mb-3 hidden" role="alert"></p>

            <button
              id="submit-btn"
              type="submit"
              class="w-full rounded-xl py-3.5 font-body font-semibold text-base text-white bg-brand-primary hover:bg-brand-primary-light transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(128,68,240,0.3)]"
            >
              Guardar nueva contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function mountChangePasswordView() {
  const form = document.getElementById("change-password-form");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const newPasswordError = document.getElementById("new-password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error",
  );
  const formError = document.getElementById("form-error");
  const toggleNewBtn = document.getElementById("toggle-new-password");
  const toggleConfirmBtn = document.getElementById("toggle-confirm-password");
  const submitBtn = document.getElementById("submit-btn");

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
  }

  function clearErrors() {
    hideError(newPasswordError);
    hideError(confirmPasswordError);
    hideError(formError);
  }

  function togglePasswordField(input, button) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    button.innerHTML = isPassword ? eyeOffIcon() : eyeIcon();
    button.setAttribute(
      "aria-label",
      isPassword ? "Ocultar contraseña" : "Mostrar contraseña",
    );
  }

  toggleNewBtn.addEventListener("click", () =>
    togglePasswordField(newPasswordInput, toggleNewBtn),
  );
  toggleConfirmBtn.addEventListener("click", () =>
    togglePasswordField(confirmPasswordInput, toggleConfirmBtn),
  );

  function validateFields() {
    let valid = true;

    if (!newPasswordInput.value || newPasswordInput.value.trim() === "") {
      showError(newPasswordError, "La nueva contraseña es obligatoria");
      valid = false;
    } else if (newPasswordInput.value.length < PASSWORD_MIN_LENGTH) {
      showError(
        newPasswordError,
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
      );
      valid = false;
    }

    if (
      !confirmPasswordInput.value ||
      confirmPasswordInput.value.trim() === ""
    ) {
      showError(confirmPasswordError, "Confirmá la nueva contraseña");
      valid = false;
    } else if (valid && newPasswordInput.value !== confirmPasswordInput.value) {
      showError(confirmPasswordError, "Las contraseñas no coinciden");
      valid = false;
    }

    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateFields()) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      await userService.changePassword({
        newPassword: newPasswordInput.value,
        confirmPassword: confirmPasswordInput.value,
      });

      const currentUser = getUser();
      setUser({ ...currentUser, mustChangePassword: false });

      const destination = ROLE_ROUTES[currentUser.roleName] || "/";
      navigate(destination);
    } catch (error) {
      // El backend devuelve mensajes de ValidationError ya claros para el usuario
      // (ej. "La nueva contraseña no puede ser igual a la temporal").
      const message =
        (error.body && error.body.message) ||
        "No pudimos actualizar tu contraseña. Intentá de nuevo.";

      showError(formError, message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar nueva contraseña";
    }
  });
}
