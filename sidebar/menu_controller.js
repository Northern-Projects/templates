import AriaController from "./aria_controller";

export default class extends AriaController {
  static targets = ["dashNav", "btnToggle" ]

  connect = () => {
    this.mobileChange();
    window.addEventListener('resize', this.mobileChange);
    this.activateItem();
  }

  activateItem = () => {
    const currentPath = document.location.pathname;
    document.querySelectorAll('.dash-nav-options .dash-nav-item').forEach((item) => {
      if ((currentPath.includes(item.pathname) && (item.pathname !== "/" && item.pathname !== "/en")) || currentPath === item.pathname) {
        item.classList.add('active');
        this.ariaCurrent(item);
      }
      else {
        item.classList.remove('active');
      }
    })
  }

  mobileChange = () => {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width < 1200) {
      if (!this.dashNavTarget.classList.contains('minimized')) {
        this.changeToSmallLogo();
        this.dashNavTarget.classList.add('minimized');
      }
    }
    else {
      if (this.dashNavTarget.classList.contains('minimized')) {
        this.changeToBigLogo();
        this.dashNavTarget.classList.remove('minimized');
      }
    }
    this.ariaNav(this.dashNavTarget, this.btnToggleTargets);
  }

  minimizeMenu = () => {
    this.dashNavTarget.classList.toggle('minimized');
    if (this.dashNavTarget.classList.contains('minimized')) {
      this.changeToSmallLogo();
      this.addTooltipMenu(this.dashNavTarget.querySelectorAll('.dash-nav-item'))
    } else {
      this.changeToBigLogo();
      this.removeTooltipMenu(this.dashNavTarget.querySelectorAll('.dash-nav-item'))
    }
    this.ariaNav(this.dashNavTarget, this.btnToggleTargets);
  }

  // When close add
  addTooltipMenu = (navLinks) => {
    navLinks.forEach((link) => {
      const text = link.querySelector('p').innerText;
      link.setAttribute('data-original-title', text);
      link.setAttribute('data-toggle', 'tooltip');
      link.setAttribute('data-placement', 'right');
    })
  }

  // Quando open remove
  removeTooltipMenu = (navLinks) => {
    navLinks.forEach((link) => {
      link.removeAttribute('data-original-title');
      link.removeAttribute('data-toggle');
      link.removeAttribute('data-placement');
    })
  }

  changeToSmallLogo = () => {
    const logoImg = document.querySelector('#company-logo');
    
    logoImg.src = "https://avatars.githubusercontent.com/u/69258991?s=200&v=4";
    logoImg.id = "small-company-logo";
  }

  changeToBigLogo = () => {
    const logoImg = document.querySelector('#small-company-logo');
    logoImg.src = "https://www.northern.com.br/assets/brand/northern-white-b016f6382c8e107fb942a502d1c2543e5cfa08889189896517031bc3837cf523.png";
    logoImg.id = "company-logo";
  }

  disconnect = () => {
    window.removeEventListener('resize', this.mobileChange);
  }
}
