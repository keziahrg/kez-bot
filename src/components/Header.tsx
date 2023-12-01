import { ThemeToggle } from "./ThemeToggle";

export const Header = () => (
  <header className="absolute left-0 right-0 top-0 z-10 bg-white bg-opacity-60 font-bold text-black backdrop-blur-md dark:bg-black dark:bg-opacity-60 dark:text-white">
    <div className="mx-auto flex max-w-xl items-center justify-between p-4">
      <h1>KezBot</h1>
      <ThemeToggle />
    </div>
  </header>
);
