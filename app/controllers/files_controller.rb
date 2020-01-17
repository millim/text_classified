class FilesController < ApplicationController

  def create
    if params[:files] == 'all'
      Canvas.success_wait_all params[:dir_id]
    else
      Canvas.success_wait_verifier_files params[:dir_id], params[:files].split(',')
    end
    head :no_content
  end

  def destroy
    Canvas.delete_wait_verifier_files params[:dir_id], params[:files].split(',')
    head :no_content
  end
end