import { Controller } from "@hotwired/stimulus";

export default class AriaController extends Controller {
  static targets = []

  showSelected = (target) => {
    const checkboxesName = target.dataset.checkboxes
    const name = checkboxesName.split(/[-_]/)[0];
    const inputType = checkboxesName.split(/[-_]/)[1];
    let n = 0;
    let strLabel = "";
    const checkboxes = target.querySelectorAll(`input[type="checkbox"][name="${name}[${inputType}][]"]`);
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked === true) {
        n++
      }
    }
    switch (n) {
      case checkboxes.length:
        // strLabel = I18n.t('javascript.dropdown_select.all');
        break;
      default:
        // strLabel = I18n.t('javascript.dropdown_select', { count: n });
        break;
    }
    target.closest('div').querySelector('#dropdownSelectBtn').innerText = strLabel;
  }

  ariaNav = (target, buttonsToggle) => {
    buttonsToggle.forEach((btnToggle) => {
      this.aria(btnToggle, "aria-expanded", target.classList.contains('minimized'))
    })
  }

  aria = (target, ariaAttribute, condition) => {
    let ariaAtt = target.getAttribute(ariaAttribute);
    condition ? ariaAtt = "false" : ariaAtt = "true";
    target.setAttribute(ariaAttribute, ariaAtt);
  }

  ariaSelected = (e) => {
    const currentTab = e.currentTarget;
    currentTab.parentElement.children.forEach((tab) => {
      tab.setAttribute('aria-selected', "false");
      tab.classList.remove('active');
    })
    currentTab.classList.add('active');
    currentTab.setAttribute('aria-selected', 'true');
  }

  ariaCurrent = (currentLink) => {
    Array.from(currentLink.parentElement.children).forEach((link) => {
      link.removeAttribute('aria-current');
    })
    currentLink.setAttribute('aria-current', 'page');
  }
}