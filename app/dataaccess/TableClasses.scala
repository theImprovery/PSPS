package dataaccess

import java.sql.Timestamp

import models.{Invitation, User, UuidForForgotPassword}
import slick.lifted.Tag
import slick.jdbc.PostgresProfile.api._


class UserTable(tag:Tag) extends Table[User](tag,"users") {

  def id                = column[Long]("id",O.PrimaryKey, O.AutoInc)
  def username          = column[String]("username")
  def name              = column[String]("name")
  def email             = column[String]("email")
  def encryptedPassword = column[String]("encrypted_password")

  def * = (id, username, name, email, encryptedPassword) <> (User.tupled, User.unapply)

}

class InvitationTable(tag:Tag) extends Table[Invitation](tag, "invitations") {
  def email = column[String]("email")
  def date  = column[Timestamp]("date")
  def uuid  = column[String]("uuid")
  def sender  = column[String]("sender")

  def pk = primaryKey("invitation_pkey", (email, sender))

  def * = (email, date, uuid, sender) <> (Invitation.tupled, Invitation.unapply)
}
class UuidForForgotPasswordTable(tag:Tag) extends Table[UuidForForgotPassword](tag, "uuid_for_forgot_password"){
  def username = column[String]("username")
  def uuid     = column[String]("uuid")
  def reset_password_date = column[Timestamp]("reset_password_date")

  def pk = primaryKey("uuid_for_forgot_password_pkey", (username, uuid))

  def * = (username, uuid, reset_password_date) <> (UuidForForgotPassword.tupled, UuidForForgotPassword.unapply)
}