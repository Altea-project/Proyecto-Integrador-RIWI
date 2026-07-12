import { EMAIL_REGEX, PASSWORD_MIN_LENGTH } from "./constants.js";

// Valida que el correo no esté vacío y cumpla el formato básico
export function isValidEmail(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "El correo electrónico es obligatorio" };
  }

  if (!EMAIL_REGEX.test(value.trim())) {
    return { valid: false, message: "Ingresa un correo electrónico válido" };
  }

  return { valid: true, message: "" };
}

// Valida que la contraseña no esté vacía y cumpla la longitud mínima
export function isValidPassword(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "La contraseña es obligatoria" };
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    };
  }

  return { valid: true, message: "" };
}

// Redirige al validador correspondiente según el nombre del campo
export function validateField(field, value) {
  if (field === "email") return isValidEmail(value);
  if (field === "password") return isValidPassword(value);
  return { valid: true, message: "" };
}

// Itera sobre un objeto de campos y devuelve todos los errores encontrados
export function validateForm(fields) {
  const errors = {};

  for (const [field, value] of Object.entries(fields)) {
    const result = validateField(field, value);
    if (!result.valid) {
      errors[field] = result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
