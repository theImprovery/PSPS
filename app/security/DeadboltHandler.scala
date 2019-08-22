package security

import be.objectify.deadbolt.scala.AuthenticatedRequest
import be.objectify.deadbolt.scala.models.{Role, Subject}
import controllers.{FlashKeys, Informational, routes}
import dataaccess.UsersDAO
import models.User
import play.api.i18n.{Langs, Messages, MessagesApi, MessagesImpl, MessagesProvider}
import play.api.mvc.{Request, Result, Results}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


case class UserSubject(user:User) extends Subject
{
  override def identifier: String = user.username
  override def roles = List[Role]()
  override def permissions = Nil
}


/**
  * Created by michael on 12/3/17.
  */
class DeadboltHandler(users:UsersDAO, langs:Langs, messagesApi:MessagesApi) extends be.objectify.deadbolt.scala.DeadboltHandler {

  implicit val messagesProvider: MessagesProvider = {
    MessagesImpl(langs.availables.head, messagesApi)
  }

  override def beforeAuthCheck[A](request: Request[A]) = Future(None)

  override def getDynamicResourceHandler[A](request: Request[A]) = Future(None)

  override def getSubject[A](request: AuthenticatedRequest[A]):Future[Option[Subject]] = {
    request.session.get("userId").map( sId => users.get(sId.toLong).map(_.map(u=>UserSubject(u))) )
      .getOrElse( Future(None) )
  }

  /**
    * When authentication fails, store the target URL in the session and go to login page.
    * @param request the unauthorized request
    * @tparam A type of A
    * @return redirect to login page response
    */
  override def onAuthFailure[A](request: AuthenticatedRequest[A]): Future[Result] = {
    Future {
      val message = Informational(Informational.Level.Warning, Messages("login.pleaseLogIn"))
      if ( request.headers.get("Accept").filter(h=> h.contains("html")).isDefined ) {
        // This is a "address bar" call.
        Results.Redirect(routes.UserCtrl.showLogin()).withSession(
          request.session + ("targetUrl" -> request.path)).flashing((FlashKeys.MESSAGE,message.encoded))
      } else {
        // This is an API call
        Results.Unauthorized
      }
    }
  }


}