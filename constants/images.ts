export const images = {
  shoe: require("../assets/images/shoe.png"),
  pizza: require("../assets/images/pizza-one.png"),
  burgerTwo: require("../assets/images/burger-two.png"),
  burgerOne: require("../assets/images/burger-one.png"),
  mozarellaSticks: require("../assets/images/mozarellaSticks.png"),
  fries: require("../assets/images/fries.png"),
  burittoImage: require("../assets/images/burittoImage.png"),
  onionRings: require("../assets/images/onionRings.png"),
  saladImage: require("../assets/images/saladImage.png"),
  arrowRight: require("../assets/icons/arrow-right.png"),
  arrowDown: require("../assets/icons/arrow-down.png"),
  arrowBack: require("../assets/icons/arrow-back.png"),
  userImage: require("../assets/icons/user.png"),
  personImage: require("../assets/icons/person.png"),
  cartImage: require("../assets/icons/bag.png"),
  eyeImage: require("../assets/icons/eye.png"),
  minusImge: require("../assets/icons/minus.png"),
  plusImage: require("../assets/icons/plus.png"),
  trashImage: require("../assets/icons/trash.png"),
  logoImage: require("../assets/images/logo.png"),
  searchImage: require("../assets/icons/search.png"),
  loginGraphicsImage: require("../assets/images/login-graphic.png"),
};

type ImageLayout = {
  id: number;
  desc: string;
  title: string;
  image: any;
  color: string;
  category?: string;
};

export const image_layout: ImageLayout[] = [
  {
    id: 1,
    desc: "Oven-baked cheesy pizzas",
    title: "Pizzas",
    color: "#a57913ff",
    image: images.pizza,
    category: "pizzas",
  },
  {
    id: 2,
    desc: "Juicy grilled burgers",
    title: "Burgers",
    color: "#74633bff",
    image: images.burgerTwo,
    category: "burgers",
  },
  {
    id: 3,
    desc: "Rolled Mexican delights",
    title: "Tasty\nBurritos",
    color: "#74633bff",
    image: images.burittoImage,
    category: "burritos",
  },
  {
    id: 4,
    desc: "Balanced rice and protein bowls",
    title: "Salad Bowls",
    color: "#406e3bff",
    image: images.saladImage,
    category: "bowls",
  },
  {
    id: 5,
    desc: "Stacked and stuffed sandwiches",
    title: "Sandwiches",
    color: "#a57913ff",
    image: images.burgerOne,
    category: "sandwiches",
  },
  {
    id: 6,
    desc: "Rolled up wraps packed with flavor",
    title: "Wraps",
    color: "#406e3bff",
    image: images.burittoImage, // placeholder until you add a wrap picture
    category: "wraps",
  },
  // Sides: kept for later (e.g. a "Sides" section); no category, so the home screen skips them.
  {
    id: 7,
    desc: "Crispy golden fries",
    title: "Fries",
    color: "#a57913ff",
    image: images.fries,
  },
  {
    id: 8,
    desc: "Golden, gooey mozzarella sticks",
    title: "Mozzarella Sticks",
    color: "#74633bff",
    image: images.mozarellaSticks,
  },
  {
    id: 9,
    desc: "Crunchy onion rings",
    title: "Onion Rings",
    color: "#a57913ff",
    image: images.onionRings,
  },
];
