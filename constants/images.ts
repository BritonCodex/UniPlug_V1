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
};

export const image_layout: ImageLayout[] = [
  {
    id: 1,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Pizzas`,
    color: "#a57913ff",
    image: images.pizza,
  },
  {
    id: 2,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Burger`,
    color: "#74633bff",
    image: images.burgerTwo,
  },
  {
    id: 3,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Fries`,
    color: "#a57913ff",
    image: images.burgerOne,
  },
  {
    id: 5,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `mozarella sticks`,
    color: "#74633bff",
    image: images.mozarellaSticks,
  },
  {
    id: 6,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: "Onion Rings",
    color: "#a57913ff",
    image: images.onionRings,
  },
  {
    id: 7,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Tasty\nBuritto`,
    color: "#74633bff",
    image: images.burittoImage,
  },
  {
    id: 8,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: "Salad",
    color: "#406e3bff",
    image: images.saladImage,
  },
];
