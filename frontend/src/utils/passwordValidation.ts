export interface ResultadoValidacion {
  valid: boolean;
  messages: string[];
}

export function validatePassword(password: string): ResultadoValidacion {
  const messages: string[] = [];
  if (!password) messages.push("La contraseña es obligatoria.");
  if (password.length < 8) messages.push("Debe tener al menos 8 caracteres.");
  if (!/[A-Z]/.test(password))
    messages.push("Debe incluir al menos una letra mayúscula.");
  if (!/[a-z]/.test(password))
    messages.push("Debe incluir al menos una letra minúscula.");
  if (!/[0-9]/.test(password))
    messages.push("Debe incluir al menos un número.");
  if (!/[!@#$%^&*]/.test(password))
    messages.push("Debe incluir al menos un símbolo (!@#$%^&*).");

  return { valid: messages.length === 0, messages };
}
