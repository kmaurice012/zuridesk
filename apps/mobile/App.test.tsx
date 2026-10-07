import renderer, { act } from "react-test-renderer";

import App from "./App";

it("renders the mobile foundation shell", () => {
  let tree: renderer.ReactTestRenderer | undefined;

  act(() => {
    tree = renderer.create(<App />);
  });

  expect(tree?.root.findByProps({ children: "ZURIDESK" })).toBeDefined();
});
