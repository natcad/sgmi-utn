export function generarPasswordTemporal() {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let password = "";
  for (let i = 0; i < 10; i++) {
    const index = Math.floor(Math.random() * caracteres.length);
    password += caracteres[index];
  }
  return password;
}
