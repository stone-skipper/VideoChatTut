import create from "zustand";
import { produce } from "immer";

export const usePostitStore = create((set) => ({
  keyboard: null,
  postit: [
    { type: "text", content: "magic wall" },
    { type: "img", content: "img/Frame1079.png", size: 200 },
    { type: "text", content: "blah blah" },
    { type: "img", content: "img/Frame1077.png", size: 300 },
  ],
  addPostit: (newContent) =>
    set((state) => ({ postit: [...state.postit, newContent] })),
  removeRule: (index) =>
    set(
      produce((draft) => {
        draft.postit.splice(index, 1);
      })
    ),
  //   increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  //   removeAllBears: () => set({ bears: 0 }),
}));
