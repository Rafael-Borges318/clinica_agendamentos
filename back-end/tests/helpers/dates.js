export function diaUtilFuturo() {
  const data = new Date();
  data.setDate(data.getDate() + 7);

  while (data.getDay() === 0) {
    data.setDate(data.getDate() + 1);
  }

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}
