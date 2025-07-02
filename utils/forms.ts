export const maskCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let masked = digits;
  masked = masked.replace(/^(\d{3})(\d)/, '$1.$2');
  masked = masked.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  masked = masked.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  return masked;
};

export const maskCEP = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  let masked = digits;
  masked = masked.replace(/^(\d{2})(\d)/, '$1.$2');
  masked = masked.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2-$3');
  return masked;
};

export const maskPhone = (value: string) => {
  // remove tudo que não é dígito
  let digits = value.replace(/\D/g, '');
  // strip country code se o usuário digitar “55” no começo
  if (digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  // no Brasil: DDD(2) + número(9) = 11
  digits = digits.slice(0, 11);

  let result = '+55 ';
  if (digits.length > 0) {
    result += '(' + digits.slice(0, Math.min(2, digits.length));
    if (digits.length >= 2) {
      result += ')';
    }
  }
  if (digits.length > 2) {
    result += ' ' + digits.slice(2, Math.min(7, digits.length));
  }
  if (digits.length > 7) {
    result += '-' + digits.slice(7);
  }
  return result;
};

// validação de CPF continua a mesma
export const validateCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== +cleaned[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== +cleaned[10]) return false;
  return true;
};

