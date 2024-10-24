import { atom } from "recoil";

const previousViewState = atom({
  key: "previousViewState",
  default: "bars",
});

export default previousViewState;
