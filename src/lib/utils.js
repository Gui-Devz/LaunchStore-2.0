module.exports = {
  formatBrowser(timestamp) {
    const date = new Date(timestamp);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = `${date.getFullYear()}`;
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return {
      day: day,
      month: month,
      year: year,
      hours: hours,
      minutes: minutes,
      iso: `${year}-${month}-${day}`,
      birthday: `${day}/${month}`,
      format: `${day}/${month}/${year}`,
    };
  },

  //Function guarantees that the arrays are set for the database
  arrayDB(array) {
    let newArray = [];

    for (let i of array) {
      i = `"${i}"`;
      newArray.push(i);
    }

    return `{${newArray}}`;
  },

  /* Function guarantees that inputs that are arrays don't have blank content
  inside it like ""
  */
  validationOfInputs(inputs) {
    let newInputs = [];
    for (let i = 0; i < inputs.length; i++) {
      const inputClone = inputs[i].trim();

      if (inputClone != "") {
        newInputs.push(inputs[i]);
      }
    }

    return newInputs;
  },

  formatPricing(value) {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  },

  formatPath(files, req) {
    let photos = files.map((file) => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path
        .replace("public", "")
        .split("\\")
        .join("/")}`,
    }));

    return photos;
  },
  formatCpfCnpj(value) {
    let newValue = value;
    newValue = newValue.replace(/\D/g, "");

    if (newValue.length > 14) {
      newValue = newValue.slice(0, -1);
    }

    if (newValue.length > 11) {
      //CNPJ
      //88.998.914/0001-34
      newValue = newValue.replace(/(\d{2})(\d)/, "$1.$2");
      newValue = newValue.replace(/(\d{3})(\d)/, "$1.$2");
      newValue = newValue.replace(/(\d{3})(\d)/, "$1/$2");
      newValue = newValue.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      //CPF
      //111.222.333-95
      newValue = newValue.replace(/(\d{3})(\d)/, "$1.$2");
      newValue = newValue.replace(/(\d{3})(\d)/, "$1.$2");
      newValue = newValue.replace(/(\d{3})(\d)/, "$1-$2");
    }

    return newValue;
  },
  formatCep(value) {
    let newValue = value;
    newValue = newValue.replace(/\D/g, "");

    if (newValue.length > 8) {
      newValue = newValue.slice(0, -1);
    }
    //CEP
    //65041-081
    newValue = newValue.replace(/(\d{5})(\d)/, "$1-$2");
    return newValue;
  },

  validationOfBlankForms(fields) {
    const keys = Object.keys(fields);
    let empty = false;

    keys.forEach((key) => {
      if (fields[key] === "" && key !== "removed_photos") {
        empty = true;
      }
    });

    return empty;
  },
};
