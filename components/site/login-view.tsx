"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FlowField, FlowPage } from "@/components/flow/flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginView() {
  const router = useRouter()
  const [signup, setSignup] = useState(false)
  return (
    <FlowPage closeHref="/explore">
      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-8 pb-12 md:pt-16">
        <h1 className="text-center font-display text-6xl text-balance md:text-7xl">
          {signup ? "Créez votre compte" : "Content de vous revoir"}
        </h1>
        <p className="mt-4 text-center text-muted-foreground">
          {signup
            ? "Pour réserver et suivre vos animaux au même endroit."
            : "Connectez-vous pour retrouver vos réservations."}
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Button size="lg" variant="secondary">
            Continuer avec Google
          </Button>
          <Button size="lg" variant="secondary">
            Continuer avec Apple
          </Button>
        </div>

        <div className="my-8 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou avec votre e-mail
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            router.push("/explore")
          }}
        >
          {signup && (
            <FlowField id="first" label="Prénom">
              <Input autoComplete="given-name" id="first" size="lg" />
            </FlowField>
          )}
          <FlowField id="email" label="E-mail">
            <Input
              autoComplete="email"
              defaultValue={signup ? "" : "julie.moreau@mail.fr"}
              id="email"
              size="lg"
              type="email"
            />
          </FlowField>
          <FlowField
            hint={signup ? "8 caractères minimum" : undefined}
            id="password"
            label="Mot de passe"
          >
            <Input
              autoComplete={signup ? "new-password" : "current-password"}
              id="password"
              size="lg"
              type="password"
            />
          </FlowField>
          {!signup && (
            <button
              className="text-sm font-semibold text-link underline underline-offset-4"
              type="button"
            >
              Mot de passe oublié ?
            </button>
          )}
          <Button className="w-full" size="lg" type="submit">
            {signup ? "Créer mon compte" : "Se connecter"}
          </Button>
        </form>

        <p className="mt-8 text-center">
          {signup ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
          <button
            className="font-semibold text-link underline underline-offset-4"
            onClick={() => setSignup((s) => !s)}
            type="button"
          >
            {signup ? "Se connecter" : "S'inscrire"}
          </button>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Vous êtes professionnel ?{" "}
          <Link
            className="font-semibold text-link underline underline-offset-4"
            href="/today"
          >
            Espace pro
          </Link>
        </p>
      </div>
    </FlowPage>
  )
}
