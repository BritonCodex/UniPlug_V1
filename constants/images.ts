export const images = {
  shoe: require("../assets/images/shoe.png"),
  arrowRight: require("../assets/icons/arrow-right.png"),
  arrowDown: require("../assets/icons/arrow-down.png"),
  arrowBack: require("../assets/icons/arrow-back.png"),
  userImage: require("../assets/icons/user.png"),
  personImage: require("../assets/icons/person.png"),
  cartImage: require("../assets/icons/bag.png"),
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
    title: `Unisex\nSneakers`,
    color: "#a57913ff",
    image: images.shoe,
  },
  {
    id: 2,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Unisex\nSneakers`,
    color: "#74633bff",
    image: images.shoe,
  },
  {
    id: 3,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Unisex\nSneakers`,
    color: "#a0967eff",
    image: images.shoe,
  },
  {
    id: 4,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Unisex\nSneakers`,
    color: "#aaa599ff",
    image: images.shoe,
  },

  {
    id: 5,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Unisex\nSneakers`,
    color: "#aaa599ff",
    image: images.shoe,
  },
  {
    id: 6,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Unisex\nSneakers`,
    color: "#aaa599ff",
    image: images.shoe,
  },
  {
    id: 7,
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.",
    title: `Unisex\nSneakers`,
    color: "#aaa599ff",
    image: images.shoe,
  },
];
