# React with Clean Architecture

`도메인 주도 디자인(DDD: Domain-driven Design)`의 원칙과 `클린 아키텍처`를 기반으로 하는 React 아키텍처에 대한 작은 아이디어 프로젝트입니다. 클린 아키텍처의 핵심 원칙인 `프레임워크 독립성`을 최대한 유지하기 위하여 주요 도메인 로직과 비즈니스 규칙은 프레임워크와 무관하게 작성하고 UI 레이어에 한해서만 React에 의존하도록 설계하였습니다.

이 프로젝트에서는 Vite의 `mock-server`를 사용하여 글 목록을 출력, 추가, 삭제하는 간단한 기능만 가지고 있습니다. 이는 간편하게 전체적인 프로젝트의 구성이나 동작을 확인할 수 있으며, 동시에 신규 프로젝트의 보일러 플레이트 코드로 사용을 생각하며 개발되었습니다.

#### ⚠️ 중단됨(2025-01-13)

> 이 프로젝트는 "[clean-architecture-with-typescript](https://github.com/falsy/clean-architecture-with-typescript)" 프로젝트와 많은 부분 중복되어 개발이 중단되었습니다. 이후 관련 업데이트는 "clean-architecture-with-typescript"를 통해서만 이루어집니다.

## Languages

- [English](https://github.com/falsy/react-width-clean-architecture)
- [한글](https://github.com/falsy/react-width-clean-architecture/blob/main/README-ko.md)

## Use Stack

TypeScript, Vite, React, Jotai, Tailwind CSS, Axios, ESLint, Jest, RTL, Cypress, Github Actions

## Directory Structure

```
/src
├─ constants
├─ domains
│  ├─ aggregates
│  ├─ entities
│  ├─ useCases
│  ├─ repositories
│  │  └─ interfaces
│  ├─ dtos
│  │  └─ interfaces
│  └─ vos
├─ adapters
│  ├─ repositories
│  ├─ infrastructures
│  ├─ dtos
│  └─ vms
├─ di
└─ frameworks
   ├─ contexts
   ├─ hooks
   └─ components
      ├─ pages
      ├─ templates
      ├─ organisms
      ├─ molecules
      └─ atoms
```

프로젝트의 디렉토리 구조는 Clean Architecture의 계층을 따라 간단하고 명확하게 설계되었습니다.  
디렉토리는 `domains`, `adapters`, `frameworks` 세 가지의 레이어로 나뉘며, `frameworks` 레이어의 UI 요소들은 `components` 디렉토리 안에서 다시 "[Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)"을 기반으로 구성하였습니다.

## Dependency Injection

di 디렉토리에 정의된 `di` 함수는 각 레이어의 의존성을 주입하여 최종적으로 의존성이 주입된 `useCases` 객체를 응답합니다.

```ts
import { API_URL } from "constants/networks"
import ClientHTTP from "adapters/infrastructures/ClientHTTP"
import repositoriesFn from "./repositories"
import useCasesFn from "./useCases"

export default function di() {
  const clientHTTP = new ClientHTTP(API_URL)
  const repositories = repositoriesFn({ clientHTTP })
  const useCases = useCasesFn(repositories)

  return useCases
}
```

샘플 코드에서는 HTTP 통신을 위한 fecth API를 클래스로 캡슐화(ClientHTTP)해서 repository에 바로 주입하여 사용하였지만, fetch API 뿐만 아니라 다양한 외부 요소와의 연결이 있다면 예시의 repositories 함수처럼 infrastructures 함수를 정의하고 infrastructures을 repositories에 주입하여 사용할 수도 있습니다.

```ts
import infrastructuresFn from "./infrastructures"
import repositoriesFn from "./repositories"
import useCasesFn from "./useCases"

export default function di() {
  const infrastructures = infrastructuresFn()
  const repositories = repositoriesFn(infrastructures)
  const useCases = useCasesFn(repositories)

  return useCases
}
```

이전 버전까지는 prsenters 레이어까지 함께 정의하고 의존성을 주입하여 최종적으로 의존성이 주입된 Presenters 객체를 사용하였지만, 이제는 의존성이 주입된 useCases 객체를 가지고 React Hooks을 통해서 Presenters 레이어의 역할을 수행하도록 변경하였습니다.

## Presenters

React Hooks와 전역 상태 관리 라이브러리인 [Jotai](https://jotai.org/)를 활용하여 각 도메인의 Presenters 레이어를 구현하였습니다.

```ts
import { useCallback, useMemo, useTransition } from "react"
import { atom, useAtom } from "jotai"
import useCases from "di/index"
import IPost from "domains/aggregates/interfaces/IPost"

const PostsAtoms = atom<IPost[]>([])

export default function usePosts() {
  const di = useMemo(() => useCases(), [])

  const [posts, setPosts] = useAtom<IPost[]>(PostsAtoms)
  const [isPending, startTransition] = useTransition()

  const getPosts = useCallback(async () => {
    startTransition(async () => {
      const resPosts = await di.post.getPosts()
      setPosts(resPosts)
    })
  }, [di.post, setPosts])

  ...

  return {
    isPending,
    posts,
    getPosts,

    ...
  }
}
```

위 샘플 코드와 같이 usePosts라는 Post 도메인에 해당하는 Presenters를 구성하였으며 Jotai를 활용한 전역 상태의 `Atom(PostsAtoms)`과 앞서 선언한 di 함수를 통해서, 최종적으로 의존성이 주입된 useCases를 기반으로 Post에 대한 다양한 기능의 메서드를 정의하고 제공합니다.

```ts
import { useCallback, useMemo, useOptimistic, useTransition } from "react"
import { atom, useAtom } from "jotai"
import useCases from "di/index"
import IPost from "domains/aggregates/interfaces/IPost"

const PostsAtoms = atom<IPost[]>([])

export default function usePosts() {
  const di = useMemo(() => useCases(), [])

  const [posts, setPosts] = useAtom<IPost[]>(PostsAtoms)
  const [optimisticPosts, setOptimisticPosts] = useOptimistic(posts)
  const [isPending, startTransition] = useTransition()

  ...

  const deletePost = useCallback(
    async (postId: string) => {
      startTransition(async () => {
        setOptimisticPosts((prevPosts) => {
          return prevPosts.filter((post) => post.id !== postId)
        })

        try {
          const isSucess = await di.post.deletePost(postId)
          if (isSucess) {
            const resPosts = await di.post.getPosts()
            setPosts(resPosts)
          }
        } catch (e) {
          console.error(e)
        }
      })
    },
    [di.post, setOptimisticPosts, setPosts]
  )

  return {
    isPending,
    posts: optimisticPosts,
    getPosts,
    deletePost,
    ...
  }
}
```

추가로, 위와 같이 React 19에 추가된 useOptimistic를 활용하여 낙관적 업데이트를 사용할 수도 있습니다.

## Run Project

### 설치

```
pnpm install
```

### 실행

```
pnpm start
```

## 테스트

### 단위 테스트

```
pnpm test
```

### E2E 테스트

```
pnpm cypress
```

## Thank You!

많은 관심에 감사드립니다. 🙇‍♂️
