Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root to: 'canvas#index'

  resources :canvas, only: [:index, :create] do
    collection do
      get '/:type/:key', to: 'canvas#image'
    end
  end

  resources :dir do
    resources :files
  end
end
