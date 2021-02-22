import { httpGetJson, registerPlugin, ScullyConfig } from '@scullyio/scully';
import { ICharacters } from 'src/app/service/swapi/swapi.interface';
const StoryblokClient = require('storyblok-js-client');

const Storyblok = new StoryblokClient({
  accessToken: 'eFk8U1I9dapiX4AJep6Xwgtt',
});

const getAllCharacters = async () => {
  const characters: ICharacters = (await httpGetJson(
    `https://swapi.dev/api/people/`
  )) as ICharacters;

  const r = characters.results.map((character) => {
    const id = character.url.split('people/')[1].replace('/', '');
    return {
      route: `/characters/${id}`,
    };
  });

  return r;
};

function getStories(): Promise<any> {
  const startsWith = process.env.LOCALE === 'en' ? 'articles' : 'tr/articles';
  return Storyblok.getAll('cdn/stories', {
    starts_with: startsWith,
    version: 'draft',
  }).then((stories: any) => {
    const r = stories.map((story: any) => {
      return {
        route: `/articles/${story.slug}`,
      };
    });
    return r;
  });
}

const fixStaticLinksPlugin = async (html: any) => {
  const regex = new RegExp('(<a[^>]* href="/)([^"]*)"', 'gmi');
  html = html.replace(regex, `$1${process.env.LOCALE}/$2"`);
  return Promise.resolve(html);
};

registerPlugin('render', 'fixStaticLinks', fixStaticLinksPlugin);
registerPlugin('router', 'getArticles', getStories);
registerPlugin('router', 'getAllCharacters', getAllCharacters);

export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'jamstack-angular',
  outDir: `./dist/static/${process.env.LOCALE}`,
  distFolder: `./dist/jamstack-angular/${process.env.LOCALE}`,
  routes: {
    '/articles/:slug': {
      type: 'getArticles',
    },
    '/characters/:id': {
      type: 'getAllCharacters',
    },
  },
};
