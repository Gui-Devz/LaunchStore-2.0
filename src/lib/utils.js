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
  validationOfBlankForms(fields, req, res) {
    const keys = Object.keys(fields);

    for (const key of keys) {
      if (req.body[key] == "" && key != "removed_photos") {
        return res.send("Fill all the fields");
      }
    }
  },
};
