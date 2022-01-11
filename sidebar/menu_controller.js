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
        this.changeToSbLogo();
        this.dashNavTarget.classList.add('minimized');
      }
    }
    else {
      if (this.dashNavTarget.classList.contains('minimized')) {
        this.changeToSaudabeLogo();
        this.dashNavTarget.classList.remove('minimized');
      }
    }
    this.ariaNav(this.dashNavTarget, this.btnToggleTargets);
  }

  minimizeMenu = () => {
    this.dashNavTarget.classList.toggle('minimized');
    if (this.dashNavTarget.classList.contains('minimized')) {
      this.changeToSbLogo();
      this.addTooltipMenu(this.dashNavTarget.querySelectorAll('.dash-nav-item'))
    } else {
      this.changeToSaudabeLogo();
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

  changeToSbLogo = () => {
    const logoImg = document.querySelector('#saudabe-logo');
    logoImg.src = "https://saudabe.com.br/wp-content/uploads/2021/06/logo.png";
    logoImg.id = "sb-logo";
  }

  changeToSaudabeLogo = () => {
    const logoImg = document.querySelector('#sb-logo');
    logoImg.src = "https://saudabe.com.br/wp-content/uploads/2021/06/cropped-logo_aberto-1024x273.png";
    logoImg.id = "saudabe-logo";
  }

  disconnect = () => {
    window.removeEventListener('resize', this.mobileChange);
  }
}
