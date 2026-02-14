import { render } from '@testing-library/react'
import { HyperJumpViewer } from '../src'

describe('HyperJumpViewer', () => {
  it('renders correctly', () => {
    render(<HyperJumpViewer url="test.pdf" />)
  })
})