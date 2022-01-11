run "if uname | grep -q 'Darwin'; then pgrep spring | xargs kill -9; fi"

# GEMFILE
########################################
inject_into_file 'Gemfile', before: 'group :development, :test do' do
  <<~RUBY
    gem 'devise'

    gem 'autoprefixer-rails', '10.2.5'
    gem 'font-awesome-sass'
    gem 'simple_form'
  RUBY
end

inject_into_file 'Gemfile', after: 'group :development, :test do' do
  <<-RUBY
  gem 'pry-byebug'
  gem 'pry-rails'
  gem 'dotenv-rails'
  RUBY
end

gsub_file('Gemfile', /# gem 'redis'/, "gem 'redis'")

# Assets
########################################
run 'rm -rf app/assets/stylesheets'
run 'rm -rf vendor'
run 'curl -L https://github.com/lewagon/rails-stylesheets/archive/master.zip > stylesheets.zip'
run 'unzip stylesheets.zip -d app/assets && rm stylesheets.zip && mv app/assets/rails-stylesheets-master app/assets/stylesheets'
gsub_file('app/assets/stylesheets/application.scss', '@import "bootstrap/scss/bootstrap";', '@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.css");')

# Dev environment
########################################
gsub_file('config/environments/development.rb', /config\.assets\.debug.*/, 'config.assets.debug = false')

# Layout
########################################
style = <<~HTML
  <%= stylesheet_link_tag 'application', media: 'all', 'data-turbo-track': 'reload' %>
HTML
gsub_file('app/views/layouts/application.html.erb', '<%= stylesheet_link_tag "application", "data-turbo-track": "reload" %>', style)

# Flashes
########################################
file 'app/views/shared/_flashes.html.erb', <<~HTML
  <% if notice %>
    <div class="alert alert-info alert-dismissible fade show m-1" role="alert">
      <%= notice %>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  <% end %>
  <% if alert %>
    <div class="alert alert-warning alert-dismissible fade show m-1" role="alert">
      <%= alert %>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  <% end %>
HTML

inject_into_file 'app/views/layouts/application.html.erb', after: '<body>' do
  <<-HTML
    <%= render 'shared/flashes' %>
    <%= render 'shared/sidebar' if user_signed_in? %>
  HTML
end

# Generators
########################################
generators = <<~RUBY
  config.generators do |generate|
    generate.assets false
    generate.helper false
    generate.test_framework :test_unit, fixture: false
  end
RUBY

environment generators

########################################
# AFTER BUNDLE
########################################
after_bundle do
  # Generators: db + simple form + pages controller
  ########################################
  rails_command 'db:drop db:create db:migrate'
  generate('simple_form:install', '--bootstrap')
  generate(:controller, 'pages', 'home', '--skip-routes', '--no-test-framework')

  # Routes
  ########################################
  route "root to: 'pages#home'"

  # Git ignore
  ########################################
  append_file '.gitignore', <<~TXT
    # Ignore .env file containing credentials.
    .env*
    # Ignore Mac and Linux file system files
    *.swp
    .DS_Store
  TXT

  # Devise install + user
  ########################################
  generate('devise:install')
  generate('devise', 'User')

  # App controller
  ########################################
  run 'rm app/controllers/application_controller.rb'
  file 'app/controllers/application_controller.rb', <<~RUBY
    class ApplicationController < ActionController::Base
    #{  "protect_from_forgery with: :exception\n" if Rails.version < "5.2"}  before_action :authenticate_user!
    end
  RUBY

  # migrate + devise views
  ########################################
  rails_command 'db:migrate'
  generate('devise:views')

  # Devise + Turbo
  ########################################
  inject_into_file 'config/initializers/devise.rb', after: "# frozen_string_literal: true\n" do
    <<~RUBY
      Rails.application.reloader.to_prepare do
        class TurboFailureApp < Devise::FailureApp
          def respond
            if request_format == :turbo_stream
              redirect
            else
              super
            end
          end

          def skip_format?
            %w(html turbo_stream */*).include? request_format.to_s
          end
        end

        class TurboController < ApplicationController
          class Responder < ActionController::Responder
            def to_turbo_stream
              controller.render(options.merge(formats: :html))
            rescue ActionView::MissingTemplate => error
              if get?
                raise error
              elsif has_errors? && default_action
                render rendering_options.merge(formats: :html, status: :unprocessable_entity)
              else
                redirect_to navigation_location
              end
            end
          end

          self.responder = Responder
          respond_to :html, :turbo_stream
        end
      end
    RUBY
  end

  # Pages Controller
  ########################################
  run 'rm app/controllers/pages_controller.rb'
  file 'app/controllers/pages_controller.rb', <<~RUBY
    class PagesController < ApplicationController
      skip_before_action :authenticate_user!, only: [ :home ]

      def home
      end
    end
  RUBY

  # Environments
  ########################################
  environment 'config.action_mailer.default_url_options = { host: "http://localhost:3000" }', env: 'development'
  environment 'config.action_mailer.default_url_options = { host: "http://TODO_PUT_YOUR_DOMAIN_HERE" }', env: 'production'

  # Bootstrap
  ########################################
  run './bin/importmap pin bootstrap'
  
  # Sidebar
  ########################################
  run 'curl https://raw.githubusercontent.com/Northern-Projects/templates/main/sidebar/sidebar.html.erb > app/views/shared/_sidebar.html.erb'
  run 'curl https://raw.githubusercontent.com/Northern-Projects/templates/main/sidebar/menu_controller.js > app/javascript/controllers/menu_controller.js'
  run 'curl https://raw.githubusercontent.com/Northern-Projects/templates/main/sidebar/aria_controller.js > app/javascript/controllers/aria_controller.js'
  run 'curl https://raw.githubusercontent.com/Northern-Projects/templates/main/sidebar/sidebar_helper.rb > app/helpers/sidebar_helper.rb'
  
  # Dotenv
  ########################################
  run 'touch .env'

  # Rubocop
  ########################################
  run 'curl -L https://raw.githubusercontent.com/lewagon/rails-templates/master/.rubocop.yml > .rubocop.yml'

  # Git
  ########################################
  git add: '.'
  git commit: "-m 'Initial commit with devise template from https://github.com/lewagon/rails-templates'"
end
