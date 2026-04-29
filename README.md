<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->

<div align="center">
  <h2 align="center">💡 YaNotes</h2>

  <p align="center">
    Yet another note-taking app built to showcase a full-stack workflow with a
    Vue.js web client, Django REST API, secure authentication, automated tests,
    and a containerized runtime.
  </p>

  <p id="shields" align="center" markdown="1">

[![License](https://img.shields.io/badge/license-MIT-3178C6)][license]
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen)][github-pre-commit]
[![Commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen)][github-commitizen]
[![Code Style](https://img.shields.io/badge/code%20style-ruff%20%2B%20eslint-D7FF64)][ruff]
[![pre-commit.ci](https://results.pre-commit.ci/badge/github/malokhvii-eduard/yanotes/master.svg)][pre-commit.ci]
[![CI Workflow](https://github.com/malokhvii-eduard/yanotes/actions/workflows/ci.yml/badge.svg)](https://github.com/malokhvii-eduard/yanotes/actions/workflows/ci.yml)

  </p>

  <div id="demo" align="center" markdown="1">

![Demo](docs/img/demo.gif)

  </div>
</div>

## 🎉 Features

- Complete notes workspace with create, edit, copy, delete, search, sorting,
  and infinite scrolling
- Smooth account flow with registration, login, logout, protected routes,
  and restored user sessions
- Secure JWT authentication with short-lived access tokens and rotating
  HttpOnly refresh cookies
- Owner-aware access control that keeps personal notes private and gives
  administrators cross-owner tools
- Test suites covering authentication, notes workflows, routing,
  state management, composables, and shared client utilities
- CI pipeline for pre-commit checks, test suites, and Docker image builds
- Containerized app stack with Traefik in front of the web client, API,
  PostgreSQL database, and Redis cache

## 🛠️ Tech Stack

<!-- markdownlint-disable MD013 -->

[![EditorConfig](https://img.shields.io/badge/EditorConfig-FEFEFE?logo=editorconfig&logoColor=000&style=flat)][editorconfig]
[![Markdown](https://img.shields.io/badge/Markdown-000?logo=markdown&logoColor=fff&style=flat)][markdown]
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff&style=flat)][python]
[![uv](https://img.shields.io/badge/uv-DE5FE9?logo=uv&logoColor=fff&style=flat)][uv]
[![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff&style=flat)][npm]
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat)][typescript]
[![Django](https://img.shields.io/badge/Django-092E20?logo=django&logoColor=fff&style=flat)][django]
[![Django REST Framework](https://img.shields.io/badge/Django%20REST%20Framework-A30000?logo=django&logoColor=fff&style=flat)][drf]
[![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?logo=openapiinitiative&logoColor=fff&style=flat)][openapi]
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=flat)][postgresql]
[![Redis](https://img.shields.io/badge/Redis-FF4438?logo=redis&logoColor=fff&style=flat)][redis]
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?logo=vuedotjs&logoColor=fff&style=flat)][vue]
[![Vue Router](https://img.shields.io/badge/Vue%20Router-4FC08D?logo=vuedotjs&logoColor=fff&style=flat)][vue-router]
[![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=000&style=flat)][pinia]
[![VueUse](https://img.shields.io/badge/VueUse-41B883?logo=vuedotjs&logoColor=fff&style=flat)][vueuse]
[![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?logo=vuetify&logoColor=fff&style=flat)][vuetify]
[![VeeValidate](https://img.shields.io/badge/VeeValidate-4FC08D?logo=vuedotjs&logoColor=fff&style=flat)][vee-validate]
[![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=fff&style=flat)][axios]
[![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=fff&style=flat)][zod]
[![Sass](https://img.shields.io/badge/Sass-CC6699?logo=sass&logoColor=fff&style=flat)][sass]
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff&style=flat)][vite]
[![pytest](https://img.shields.io/badge/pytest-0A9EDC?logo=pytest&logoColor=fff&style=flat)][pytest]
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=fff&style=flat)][vitest]
[![Ruff](https://img.shields.io/badge/Ruff-D7FF64?logo=ruff&logoColor=000&style=flat)][ruff]
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=fff&style=flat)][eslint]
[![pre-commit](https://img.shields.io/badge/pre--commit-FAB040?logo=pre-commit&logoColor=000&style=flat)][github-pre-commit]
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=flat)][docker]
[![Traefik](https://img.shields.io/badge/Traefik-24A1C1?logo=traefikproxy&logoColor=fff&style=flat)][traefik]
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=fff&style=flat)][github-actions]

## ✍️ Contributing

*First off, thanks for taking the time to contribute!*

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the *Project*
2. Create your *Feature Branch* (`git checkout -b feature/awesome-feature`)
3. Commit your *Changes* (`git commit -m 'Add awesome feature'`)
4. Push to the *Branch* (`git push origin feature/awesome-feature`)
5. Open a *Pull Request*

## 💖 Like this project?

Leave a star if you think this project is cool or useful for you.

## ⚠️ License

`yanotes` is licensed under the MIT License. See the [LICENSE](LICENSE) for more information.

<!-- markdownlint-disable MD013 -->
<!-- Links -->
[axios]: https://axios-http.com/
[django]: https://www.djangoproject.com/
[docker]: https://www.docker.com/
[drf]: https://www.django-rest-framework.org/
[editorconfig]: https://editorconfig.org/
[eslint]: https://eslint.org/
[github-actions]: https://docs.github.com/en/actions
[github-commitizen]: https://github.com/commitizen/cz-cli
[github-pre-commit]: https://github.com/pre-commit/pre-commit
[license]: LICENSE
[markdown]: https://www.markdownguide.org/
[npm]: https://www.npmjs.com/
[openapi]: https://www.openapis.org/
[pinia]: https://pinia.vuejs.org/
[postgresql]: https://www.postgresql.org/
[pytest]: https://docs.pytest.org/
[python]: https://www.python.org/
[redis]: https://redis.io/
[ruff]: https://docs.astral.sh/ruff/
[sass]: https://sass-lang.com/
[traefik]: https://traefik.io/traefik/
[typescript]: https://www.typescriptlang.org/
[uv]: https://docs.astral.sh/uv/
[vee-validate]: https://vee-validate.logaretm.com/
[vite]: https://vite.dev/
[vitest]: https://vitest.dev/
[vue]: https://vuejs.org/
[vue-router]: https://router.vuejs.org/
[vueuse]: https://vueuse.org/
[vuetify]: https://vuetifyjs.com/
[zod]: https://zod.dev/
[pre-commit.ci]: https://results.pre-commit.ci/run/github/534330844/1777473893.CfweoDqrT6CC6A4PWs72EA
