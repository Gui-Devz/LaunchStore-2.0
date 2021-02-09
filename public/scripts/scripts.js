const Mask = {
  apply(input, func) {
    setTimeout(function () {
      input.value = Mask[func](input.value);
    }, 1);
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "");

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  },
};

const PhotosUpload = {
  preview: document.querySelector(".photos-preview"),
  uploadLimit: 6,
  files: [],
  input: "",
  handleFileInput(event) {
    PhotosUpload.input = event.target;
    const { files: fileList } = event.target;
    const { loadPhotoDiv } = PhotosUpload;

    if (PhotosUpload.hasLimit(event)) return;

    loadPhotoDiv(fileList);

    event.target.files = PhotosUpload.getAllFiles();
  },
  loadPhotoDiv(list) {
    const { createContainerForImage } = PhotosUpload;

    Array.from(list).forEach((file) => {
      PhotosUpload.files.push(file);

      const reader = new FileReader();

      reader.onload = () => {
        createContainerForImage(reader.result);
      };
      reader.readAsDataURL(file);
    });
  },

  createContainerForImage(readerResult) {
    const { getContainer, preview } = PhotosUpload;
    const image = new Image();
    image.src = String(readerResult);

    const container = getContainer(image);

    preview.appendChild(container);
  },
  hasLimit(event) {
    const { uploadLimit, files, input } = PhotosUpload;

    const totalPhotoDivs = document.querySelectorAll(".photo");
    console.log(totalPhotoDivs);
    const totalFiles =
      files.length + input.files.length + totalPhotoDivs.length;

    if (totalFiles > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`);
      event.preventDefault();
      return true;
    }
    return false;
  },

  getContainer(image) {
    const container = document.createElement("div");

    container.classList.add("photo");

    container.onclick = PhotosUpload.removeImage;

    container.appendChild(image);

    container.appendChild(PhotosUpload.getCloseButton());

    return container;
  },

  getCloseButton() {
    const button = document.createElement("i");

    button.classList.add("material-icons");
    button.innerHTML = "close";

    return button;
  },
  getAllFiles() {
    const dataTransfer =
      new ClipboardEvent("").clipboardData || new DataTransfer();

    PhotosUpload.files.forEach((file) => dataTransfer.items.add(file));

    return dataTransfer.files;
  },

  removeImage(event) {
    const photosDiv = event.target.parentNode;

    const photosListEl = document.querySelectorAll(".photo");

    const index = Array.from(photosListEl).indexOf(photosDiv);

    PhotosUpload.files.splice(index, 1);

    PhotosUpload.input.files = PhotosUpload.getAllFiles();

    PhotosUpload.addRemovedPhotoIntoInput(event);

    photosDiv.remove();
  },

  addRemovedPhotoIntoInput(event) {
    const file_id = event.target.id; // getting the id from <i>
    let inputRemoved = document.querySelector(".removed-photos");
    let deleteRemoved = document.querySelector("#deleting-photos");

    if (inputRemoved || deleteRemoved) {
      inputRemoved.value += `${file_id},`;
      deleteRemoved.value += `${file_id},`;
    }
  },
};

const ImageGallery = {
  highlight: document.querySelector(".highlight > img"),
  previews: document.querySelectorAll(".gallery-preview img"),
  setImage(e) {
    const { target } = e;

    ImageGallery.previews.forEach((preview) =>
      preview.classList.remove("active")
    );
    target.classList.add("active");

    this.highlight.src = target.src;
  },
};

const Lightbox = {
  modal: document.querySelector(".lightbox-target"),
  image: document.querySelector(".lightbox-target img"),

  open(e) {
    const { target } = e;

    this.modal.style.opacity = 1;
    this.modal.style.top = 0;

    this.image.src = target.src;
  },

  close() {
    this.modal.style.opacity = 0;
    this.modal.style.top = "-100%";
  },
};
