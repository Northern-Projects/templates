module SidebarHelper
    def admin_links
      comum_links +
        link_to('#', class: "dash-nav-item") do
          "#{inline_svg_tag('managerment.svg', aria_hidden: true)}
          <p>Usuários</p>".html_safe
        end
    end
  
    def comum_links
      link_to(root_path, class: "dash-nav-item", data: { tippy_content: "Dashboard" }) do
        "#{inline_svg_tag('dash.svg', aria_hidden: true)}
        <p>Dashboard</p>".html_safe
      end
    end
  
    def sidebar_links
      if current_user.admin? || current_user.manager?
        admin_links
      else
        comum_links
      end
    end
  end
  