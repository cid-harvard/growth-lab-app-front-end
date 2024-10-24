import { atom } from "recoil";

const viewState = atom({
  key: "viewState",
  default: "bars",
});
export default viewState;
