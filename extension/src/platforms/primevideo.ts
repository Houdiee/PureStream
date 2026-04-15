import { ok, err } from "neverthrow";
import { Platform, Err } from "../platform";

const getTitle: Platform["getTitle"] = () => {
  const titles = Array.from(document.querySelectorAll(".atvwebplayersdk-title-text"));
  const title = titles.find((el) => el.textContent.trim() !== "");
  if (!title) return err(Err.TitleNotFound());
  return ok(title.textContent.trim());
};

const getVideoElement: Platform["getVideoElement"] = () => {
  const video = Array.from(document.querySelectorAll("video")).find((video) => video.hasAttribute("src"));
  return video ? ok(video) : err(Err.VideoNotFound());
};

const getSeasonAndEpNum: Platform["getSeasonAndEpNum"] = () => {
  const subtitleElement = document.querySelector(".atvwebplayersdk-subtitle-text");
  if (subtitleElement) {
    const subtitle = subtitleElement.textContent.trim();
    const regex = /Season\s+(?<season>\d+),\s+Ep\.\s+(?<episode>\d+)/;
    const match = subtitle.match(regex);
    if (match && match.groups) {
      const season = parseInt(match.groups.season, 10);
      const episode = parseInt(match.groups.episode, 10);
      return ok([season, episode]);
    }
  }
  return err(Err.SeasonAndEpNumNotFound());
};

export const primevideo: Platform = {
  getVideoElement,
  getTitle,
  getSeasonAndEpNum,
  delay: 5,
};
