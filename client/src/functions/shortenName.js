export default function shortenName(name, maxlength) {
    if (name.length > maxlength) {
      return `${name.substr(0, maxlength)}...`;
    }
    return name;
  }