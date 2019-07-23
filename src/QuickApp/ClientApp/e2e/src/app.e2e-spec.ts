
 



import { AppPage } from './app.po';

describe(' App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display application title: Application', () => {
    page.navigateTo();
    expect(page.getAppTitle()).toEqual('Application');
  });
});
