import { ok, err } from "neverthrow";
import { Platform, Err } from "../platform";

const getTitle: Platform["getTitle"] = () => {
  const titleElement = document.querySelector<HTMLElement>(".atvwebplayersdk-title-text:not(:empty)");
  const text = titleElement?.textContent?.trim();
  return text ? ok(text) : err(Err.TitleNotFound());
};

const getVideoElement: Platform["getVideoElement"] = () => {
  const video = document.querySelector<HTMLVideoElement>("video[src]");
  if (video && video.src && video.src !== "") {
    return ok(video);
  }
  return err(Err.VideoNotFound());
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
